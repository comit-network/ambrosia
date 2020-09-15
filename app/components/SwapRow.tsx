import React, { useEffect, useReducer } from 'react';
import { Box, Collapse, Flex, Icon, IconButton, Text } from '@chakra-ui/core';
import { RiExchangeLine } from 'react-icons/ri';
import CurrencyAmount from './CurrencyAmount';
import { Currency } from '../utils/currency';
import {
  Protocol,
  Role,
  SwapAction,
  SwapActionKind,
  SwapEntity,
  SwapEvent,
  SwapEventName,
  SwapProperties
} from '../utils/swap';
import SwapStep, { SwapStepName } from './SwapStep';
import { LedgerAction } from '../comit-sdk';
import { useLedgerBitcoinWallet } from '../hooks/useLedgerBitcoinWallet';
import useSWR from 'swr/esm/use-swr';
import { useCnd } from '../hooks/useCnd';
import { AxiosResponse } from 'axios';
import actionToHttpRequest from '../comit-sdk/cnd/action_to_http_request';
import { useConfig } from '../config';

export interface SwapRowProps {
  href: string;
}

type ComponentAction =
  | {
      type: 'fetchedSwap';
      value: {
        swap: SwapProperties;
        ledgerAction?: LedgerAction;
      };
    }
  | {
      type: 'actionCompleted';
      name: LedgerAction['type'];
      value: string;
    };

enum ActionStatus {
  AWAITING_USER_INTERACTION, // for actions that require user interaction
  WAITING_CONFIRMATION // once we have the wallet's response for sending the tx
}

function findSwapEventInSwap(
  swap: SwapProperties,
  eventName: SwapEventName
): SwapEvent | undefined {
  return swap.events.find(event => event.name === eventName);
}

interface State {
  swap: SwapProperties;
  alreadySeenActions: string[]; // needed becaus cnd keeps returning actions that were already "processed" but cnd did not pick up the blockchain transaction yet

  activeAction: SwapAction; // the action currently being processed, there can only be one.
  activeActionStatus: ActionStatus; // the state of the action currently being processed.
  activeActionTxId?: string; // transaction id of the currently active action
  ledgerAction?: LedgerAction;
}

function reducer(state: State, action: ComponentAction): State {
  switch (action.type) {
    case 'fetchedSwap':
      const { swap, ledgerAction } = action.value;

      // if swap undefined nothing to do
      if (!swap) {
        return state;
      }

      // if no action available, set swap, nothing else to do
      if (!swap.action) {
        return {
          ...state,
          activeAction: null,
          activeActionStatus: null,
          swap
        };
      }

      const actionAlreadySeen = state.alreadySeenActions.find(
        action => action === swap.action.href
      );

      // if action already known, set swap, nothing else to do
      if (actionAlreadySeen) {
        return {
          ...state,
          swap
        };
      }

      const newActiveAction = swap.action;
      const newAlreadySeenActions = state.alreadySeenActions;
      newAlreadySeenActions.push(newActiveAction.href);

      return {
        ...state,
        swap,
        alreadySeenActions: newAlreadySeenActions,
        activeAction: newActiveAction,
        activeActionStatus: ledgerAction
          ? ActionStatus.AWAITING_USER_INTERACTION
          : null,
        ledgerAction
      };
    case 'actionCompleted': {
      console.log('Action', action.name, 'was completed in tx', action.value);
      return {
        ...state,
        ledgerAction: null,
        activeActionTxId: action.value,
        activeActionStatus: ActionStatus.WAITING_CONFIRMATION
      };
    }
    default:
      throw new Error();
  }
}

function containsEvent(events: SwapEvent[], eventName: SwapEventName) {
  return events.find(event => event.name === eventName) !== undefined;
}

function enumKeys<E>(e: E): (keyof E)[] {
  return Object.keys(e) as (keyof E)[];
}

interface ActiveStepProps {
  swap: SwapProperties;
  href: string;
  state: State;
  dispatch: (action: ComponentAction) => void;
}

const ActiveStep = ({ swap, href, state, dispatch }: ActiveStepProps) => {
  const config = useConfig();

  for (const key of enumKeys(SwapStepName)) {
    const swapStepEnumVal = SwapStepName[key];
    const isActive = isSwapStepActive(
      swapStepEnumVal,
      swap.alpha.protocol,
      state,
      swap,
      config.ROLE
    );
    if (isActive) {
      return (
        <SwapStep
          swapId={href}
          role={config.ROLE}
          name={swapStepEnumVal}
          isActive={true}
          isUserInteractionActive={isLedgerInteractionButtonActive(
            swapStepEnumVal,
            swap.alpha.protocol,
            state,
            swap,
            config.ROLE
          )}
          event={undefined}
          asActiveStep={true}
          ledgerAction={state.ledgerAction}
          onSigned={txId => {
            dispatch({
              type: 'actionCompleted',
              name: state.ledgerAction.type,
              value: txId
            });
          }}
        />
      );
    }
  }

  return <></>;
};

export default function SwapRow({ href }: SwapRowProps) {
  const cnd = useCnd();
  const bitcoinWallet = useLedgerBitcoinWallet();
  const [show, setShow] = React.useState(false);
  const initialState: State = {
    activeAction: null,
    activeActionStatus: null,
    alreadySeenActions: [],
    swap: null
  };
  const { data: swapResponse } = useSWR<AxiosResponse<SwapEntity>>(
    href,
    path => cnd.fetch(path),
    {
      refreshInterval: 1000
    }
  );

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (swapResponse && swapResponse.data) {
      const body = swapResponse.data;

      const action = body.actions[0];
      const swap = {
        action: action,
        alpha: body.properties.alpha,
        beta: body.properties.beta,
        events: body.properties.events,
        role: body.properties.role
      };

      if (action) {
        (async () => {
          const requestConfig = await actionToHttpRequest(action);
          const response = await cnd.client.request<LedgerAction>(
            requestConfig
          );
          const ledgerAction = response.data;

          if (
            ledgerAction &&
            ledgerAction.type === 'bitcoin-broadcast-signed-transaction'
          ) {
            bitcoinWallet
              .broadcastRawTransaction(ledgerAction.payload.hex)
              .then(txId =>
                dispatch({
                  type: 'actionCompleted',
                  name: ledgerAction.type,
                  value: txId
                })
              );
            dispatch({
              type: 'fetchedSwap',
              value: { swap, ledgerAction: null }
            });
          } else {
            dispatch({
              type: 'fetchedSwap',
              value: { swap, ledgerAction: ledgerAction }
            });
          }
        })();
      } else {
        dispatch({ type: 'fetchedSwap', value: { swap, ledgerAction: null } });
      }
    }
  }, [swapResponse]);

  const handleDetailsToggle = () => setShow(!show);

  const swap = state.swap;
  if (!swap) {
    return null;
  }

  let sendAmount;
  let sendCurrency;
  let receiveAmount;
  let receiveCurrency;

  const alpha = swap.alpha;
  const beta = swap.beta;

  if (swap.role === 'Alice') {
    sendAmount = alpha.asset;
    sendCurrency =
      alpha.protocol === Protocol.HBIT ? Currency.BTC : Currency.DAI;
    receiveAmount = beta.asset;
    receiveCurrency =
      beta.protocol === Protocol.HBIT ? Currency.BTC : Currency.DAI;
  } else {
    receiveAmount = alpha.asset;
    receiveCurrency =
      alpha.protocol === Protocol.HBIT ? Currency.BTC : Currency.DAI;
    sendAmount = beta.asset;
    sendCurrency =
      beta.protocol === Protocol.HBIT ? Currency.BTC : Currency.DAI;
  }

  const sendAmountLabel = 'You send';
  const receiveAmountLabel = 'You receive';

  const sendAmountDisplay =
    sendCurrency === Currency.BTC ? (
      <CurrencyAmount
        currencyValue={sendAmount}
        topText={sendAmountLabel}
        minWidth="100px"
      />
    ) : (
      <CurrencyAmount
        currencyValue={sendAmount}
        topText={sendAmountLabel}
        minWidth="100px"
      />
    );

  const receiveAmountDisplay =
    receiveCurrency === Currency.BTC ? (
      <CurrencyAmount
        currencyValue={receiveAmount}
        topText={receiveAmountLabel}
        minWidth="100px"
      />
    ) : (
      <CurrencyAmount
        currencyValue={receiveAmount}
        topText={receiveAmountLabel}
        minWidth="100px"
      />
    );

  return (
    <Box
      maxWidth="100%"
      border="1px"
      borderColor="gray.400"
      marginBottom="1rem"
      rounded="lg"
      key={href}
      backgroundColor="gray.100"
    >
      <Flex direction="column">
        <Flex
          direction="row"
          alignItems="center"
          padding="0.5rem"
          borderBottomWidth={show ? '1px' : 0}
          borderBottomColor="gray.300"
        >
          <Box>
            <Box as={RiExchangeLine} size="30px" marginRight="0.3rem" />
          </Box>
          {/* <Spinner size="sm" marginLeft="10px" marginRight="20px"/> */}
          <Text fontSize="md" marginRight="20px" fontWeight="bold">
            Swap
          </Text>
          <Flex marginRight="20px">{sendAmountDisplay}</Flex>
          <Flex>{receiveAmountDisplay}</Flex>
          {show ? (
            <></>
          ) : (
            <Flex alignItems="center">
              <Text fontWeight="bold">Status: </Text>
            </Flex>
          )}
          <Flex width="100%" />
          {show ? (
            <></>
          ) : (
            <ActiveStep
              dispatch={dispatch}
              state={state}
              swap={swap}
              href={href}
            />
          )}
          <IconButton
            aria-label="Swap Details"
            icon={show ? 'chevron-up' : 'chevron-down'}
            onClick={handleDetailsToggle}
          >
            Show details
          </IconButton>
        </Flex>
        <Collapse isOpen={show}>
          <SwapStatus
            protocol={swap.alpha.protocol}
            href={href}
            swap={swap}
            state={state}
            dispatch={dispatch}
          />
        </Collapse>
      </Flex>
    </Box>
  );
}

interface SwapStatusProperties {
  protocol: Protocol;
  href: string;
  swap: SwapProperties;
  state: State;
  dispatch: (action: ComponentAction) => void;
}

const SwapStatus = ({
  protocol,
  href,
  swap,
  state,
  dispatch
}: SwapStatusProperties) => {
  const StepArrow = () => {
    return (
      <Flex alignSelf="flex-start" marginTop="1.8rem">
        <Icon
          name="arrow-right"
          color="gray.400"
          marginLeft="0.3rem"
          marginRight="0.3rem"
        />
      </Flex>
    );
  };

  const config = useConfig();
  const role = config.ROLE;

  const ledgerAction = state.ledgerAction;
  if (protocol === Protocol.HER20) {
    const widthPercent = role === Role.ALICE ? '25%' : '20%';
    return (
      <Flex
        direction="row"
        align="center"
        width="100%"
        justifyContent="space-between"
        alignItems="baseline"
        padding="0.5rem"
        key={href + 'swapSteps'}
      >
        <Box width={widthPercent}>
          <SwapStep
            role={role}
            swapId={href}
            name={SwapStepName.HERC20_HBIT_ALICE_DEPLOY}
            isActive={isSwapStepActive(
              SwapStepName.HERC20_HBIT_ALICE_DEPLOY,
              protocol,
              state,
              swap,
              role
            )}
            isUserInteractionActive={isLedgerInteractionButtonActive(
              SwapStepName.HERC20_HBIT_ALICE_DEPLOY,
              protocol,
              state,
              swap,
              role
            )}
            event={findSwapEventInSwap(swap, SwapEventName.HERC20_DEPLOYED)}
            ledgerAction={ledgerAction}
            onSigned={txId => {
              dispatch({
                type: 'actionCompleted',
                name: ledgerAction.type,
                value: txId
              });
            }}
          />
        </Box>
        <StepArrow />
        <Box width={widthPercent}>
          <SwapStep
            role={role}
            swapId={href}
            name={SwapStepName.HERC20_HBIT_ALICE_FUND}
            isActive={isSwapStepActive(
              SwapStepName.HERC20_HBIT_ALICE_FUND,
              protocol,
              state,
              swap,
              role
            )}
            isUserInteractionActive={isLedgerInteractionButtonActive(
              SwapStepName.HERC20_HBIT_ALICE_FUND,
              protocol,
              state,
              swap,
              role
            )}
            event={findSwapEventInSwap(swap, SwapEventName.HERC20_FUNDED)}
            ledgerAction={ledgerAction}
            onSigned={txId => {
              dispatch({
                type: 'actionCompleted',
                name: ledgerAction.type,
                value: txId
              });
            }}
          />
        </Box>
        <StepArrow />
        <Box width={widthPercent}>
          <SwapStep
            role={role}
            swapId={href}
            name={SwapStepName.HERC20_HBIT_BOB_FUND}
            isActive={isSwapStepActive(
              SwapStepName.HERC20_HBIT_BOB_FUND,
              protocol,
              state,
              swap,
              role
            )}
            isUserInteractionActive={isLedgerInteractionButtonActive(
              SwapStepName.HERC20_HBIT_BOB_FUND,
              protocol,
              state,
              swap,
              role
            )}
            event={findSwapEventInSwap(swap, SwapEventName.HBIT_FUNDED)}
            ledgerAction={ledgerAction}
            onSigned={txId => {
              dispatch({
                type: 'actionCompleted',
                name: ledgerAction.type,
                value: txId
              });
            }}
          />
        </Box>
        <StepArrow />
        <Box width={widthPercent}>
          <SwapStep
            role={role}
            swapId={href}
            name={SwapStepName.HERC20_HBIT_ALICE_REDEEM}
            isActive={isSwapStepActive(
              SwapStepName.HERC20_HBIT_ALICE_REDEEM,
              protocol,
              state,
              swap,
              role
            )}
            isUserInteractionActive={isLedgerInteractionButtonActive(
              SwapStepName.HERC20_HBIT_ALICE_REDEEM,
              protocol,
              state,
              swap,
              role
            )}
            event={findSwapEventInSwap(swap, SwapEventName.HBIT_REDEEMED)}
            ledgerAction={ledgerAction}
            onSigned={txId => {
              dispatch({
                type: 'actionCompleted',
                name: ledgerAction.type,
                value: txId
              });
            }}
          />
        </Box>
        {role === Role.BOB && (
          <>
            <StepArrow />
            <Box width={widthPercent}>
              <SwapStep
                role={role}
                swapId={href}
                name={SwapStepName.HERC20_HBIT_BOB_REDEEM}
                isActive={isSwapStepActive(
                  SwapStepName.HERC20_HBIT_BOB_REDEEM,
                  protocol,
                  state,
                  swap,
                  role
                )}
                isUserInteractionActive={isLedgerInteractionButtonActive(
                  SwapStepName.HERC20_HBIT_BOB_REDEEM,
                  protocol,
                  state,
                  swap,
                  role
                )}
                event={findSwapEventInSwap(swap, SwapEventName.HERC20_REDEEMED)}
                ledgerAction={ledgerAction}
                onSigned={txId => {
                  dispatch({
                    type: 'actionCompleted',
                    name: ledgerAction.type,
                    value: txId
                  });
                }}
              />
            </Box>
          </>
        )}
      </Flex>
    );
  } else {
    const widthPercent = role === Role.ALICE ? '30%' : '20%';
    return (
      <Flex
        direction="row"
        align="center"
        width="100%"
        justifyContent="space-between"
        alignItems="baseline"
        padding="0.5rem"
        key={href + 'swapSteps'}
      >
        <Box width={widthPercent}>
          <SwapStep
            role={role}
            swapId={href}
            name={SwapStepName.HBIT_HERC20_ALICE_FUND}
            isActive={isSwapStepActive(
              SwapStepName.HBIT_HERC20_ALICE_FUND,
              protocol,
              state,
              swap,
              role
            )}
            isUserInteractionActive={isLedgerInteractionButtonActive(
              SwapStepName.HBIT_HERC20_ALICE_FUND,
              protocol,
              state,
              swap,
              role
            )}
            event={findSwapEventInSwap(swap, SwapEventName.HBIT_FUNDED)}
            ledgerAction={ledgerAction}
            onSigned={txId => {
              dispatch({
                type: 'actionCompleted',
                name: ledgerAction.type,
                value: txId
              });
            }}
          />
        </Box>
        {role === Role.BOB && (
          <>
            <StepArrow />
            <Box width={widthPercent}>
              <SwapStep
                role={role}
                swapId={href}
                name={SwapStepName.HBIT_HERC20_BOB_DEPLOY}
                isActive={isSwapStepActive(
                  SwapStepName.HBIT_HERC20_BOB_DEPLOY,
                  protocol,
                  state,
                  swap,
                  role
                )}
                isUserInteractionActive={isLedgerInteractionButtonActive(
                  SwapStepName.HBIT_HERC20_BOB_DEPLOY,
                  protocol,
                  state,
                  swap,
                  role
                )}
                event={findSwapEventInSwap(swap, SwapEventName.HERC20_DEPLOYED)}
                ledgerAction={ledgerAction}
                onSigned={txId => {
                  dispatch({
                    type: 'actionCompleted',
                    name: ledgerAction.type,
                    value: txId
                  });
                }}
              />
            </Box>
          </>
        )}
        <StepArrow />
        <Box width={widthPercent}>
          <SwapStep
            role={role}
            swapId={href}
            name={SwapStepName.HBIT_HERC20_BOB_FUND}
            isActive={isSwapStepActive(
              SwapStepName.HBIT_HERC20_BOB_FUND,
              protocol,
              state,
              swap,
              role
            )}
            isUserInteractionActive={isLedgerInteractionButtonActive(
              SwapStepName.HBIT_HERC20_BOB_FUND,
              protocol,
              state,
              swap,
              role
            )}
            event={findSwapEventInSwap(swap, SwapEventName.HERC20_FUNDED)}
            ledgerAction={ledgerAction}
            onSigned={txId => {
              dispatch({
                type: 'actionCompleted',
                name: ledgerAction.type,
                value: txId
              });
            }}
          />
        </Box>
        <StepArrow />
        <Box width={widthPercent}>
          <SwapStep
            role={role}
            swapId={href}
            name={SwapStepName.HBIT_HERC20_ALICE_REDEEM}
            isActive={isSwapStepActive(
              SwapStepName.HBIT_HERC20_ALICE_REDEEM,
              protocol,
              state,
              swap,
              role
            )}
            isUserInteractionActive={isLedgerInteractionButtonActive(
              SwapStepName.HBIT_HERC20_ALICE_REDEEM,
              protocol,
              state,
              swap,
              role
            )}
            event={findSwapEventInSwap(swap, SwapEventName.HERC20_REDEEMED)}
            ledgerAction={ledgerAction}
            onSigned={txId => {
              dispatch({
                type: 'actionCompleted',
                name: ledgerAction.type,
                value: txId
              });
            }}
          />
        </Box>
        {role === Role.BOB && (
          <>
            <StepArrow />
            <Box width={widthPercent}>
              <SwapStep
                role={role}
                swapId={href}
                name={SwapStepName.HBIT_HERC20_BOB_REDEEM}
                isActive={isSwapStepActive(
                  SwapStepName.HBIT_HERC20_BOB_REDEEM,
                  protocol,
                  state,
                  swap,
                  role
                )}
                isUserInteractionActive={isLedgerInteractionButtonActive(
                  SwapStepName.HBIT_HERC20_BOB_REDEEM,
                  protocol,
                  state,
                  swap,
                  role
                )}
                event={findSwapEventInSwap(swap, SwapEventName.HBIT_REDEEMED)}
                ledgerAction={ledgerAction}
                onSigned={txId => {
                  dispatch({
                    type: 'actionCompleted',
                    name: ledgerAction.type,
                    value: txId
                  });
                }}
              />
            </Box>
          </>
        )}
      </Flex>
    );
  }
};

function isSwapStepActiveForAlice(
  swapStep: SwapStepName,
  alphaProtocol: Protocol,
  state: State,
  swap: SwapProperties
) {
  const activeAction = state.activeAction;
  const events = swap.events;

  if (alphaProtocol === Protocol.HER20) {
    switch (swapStep) {
      case SwapStepName.HERC20_HBIT_ALICE_DEPLOY:
        return (
          activeAction &&
          activeAction.name === SwapActionKind.DEPLOY &&
          !containsEvent(events, SwapEventName.HERC20_DEPLOYED)
        );
      case SwapStepName.HERC20_HBIT_ALICE_FUND:
        return (
          activeAction &&
          activeAction.name === SwapActionKind.FUND &&
          containsEvent(events, SwapEventName.HERC20_DEPLOYED) &&
          !containsEvent(events, SwapEventName.HERC20_FUNDED)
        );
      case SwapStepName.HERC20_HBIT_BOB_FUND:
        return (
          containsEvent(events, SwapEventName.HERC20_DEPLOYED) &&
          containsEvent(events, SwapEventName.HERC20_FUNDED) &&
          !containsEvent(events, SwapEventName.HBIT_FUNDED)
        );
      case SwapStepName.HERC20_HBIT_ALICE_REDEEM:
        return (
          activeAction &&
          activeAction.name === SwapActionKind.REDEEM &&
          containsEvent(events, SwapEventName.HERC20_DEPLOYED) &&
          containsEvent(events, SwapEventName.HERC20_FUNDED) &&
          containsEvent(events, SwapEventName.HBIT_FUNDED) &&
          !containsEvent(events, SwapEventName.HBIT_REDEEMED)
        );
      default:
        return false;
    }
  } else {
    switch (swapStep) {
      case SwapStepName.HBIT_HERC20_ALICE_FUND:
        return (
          activeAction &&
          activeAction.name === SwapActionKind.FUND &&
          !containsEvent(events, SwapEventName.HBIT_FUNDED)
        );
      case SwapStepName.HBIT_HERC20_BOB_FUND:
        return (
          containsEvent(events, SwapEventName.HBIT_FUNDED) &&
          !containsEvent(events, SwapEventName.HERC20_FUNDED)
        );
      case SwapStepName.HBIT_HERC20_ALICE_REDEEM:
        return (
          activeAction &&
          activeAction.name === SwapActionKind.REDEEM &&
          containsEvent(events, SwapEventName.HBIT_FUNDED) &&
          containsEvent(events, SwapEventName.HERC20_DEPLOYED) &&
          containsEvent(events, SwapEventName.HERC20_FUNDED) &&
          !containsEvent(events, SwapEventName.HERC20_REDEEMED)
        );
      default:
        return false;
    }
  }
}

function isSwapStepActiveForBob(
  swapStep: SwapStepName,
  alphaProtocol: Protocol,
  state: State,
  swap: SwapProperties
) {
  const activeAction = state.activeAction;
  const events = swap.events;

  if (alphaProtocol === Protocol.HER20) {
    switch (swapStep) {
      case SwapStepName.HERC20_HBIT_ALICE_DEPLOY:
        return (
          !activeAction && !containsEvent(events, SwapEventName.HERC20_DEPLOYED)
        );
      case SwapStepName.HERC20_HBIT_ALICE_FUND:
        return (
          !activeAction &&
          containsEvent(events, SwapEventName.HERC20_DEPLOYED) &&
          !containsEvent(events, SwapEventName.HERC20_FUNDED)
        );
      case SwapStepName.HERC20_HBIT_BOB_FUND:
        return (
          activeAction &&
          activeAction.name === SwapActionKind.FUND &&
          containsEvent(events, SwapEventName.HERC20_FUNDED) &&
          !containsEvent(events, SwapEventName.HBIT_FUNDED)
        );
      case SwapStepName.HERC20_HBIT_ALICE_REDEEM:
        return (
          containsEvent(events, SwapEventName.HERC20_DEPLOYED) &&
          containsEvent(events, SwapEventName.HERC20_FUNDED) &&
          containsEvent(events, SwapEventName.HBIT_FUNDED) &&
          !containsEvent(events, SwapEventName.HBIT_REDEEMED)
        );
      case SwapStepName.HERC20_HBIT_BOB_REDEEM:
        return (
          activeAction &&
          activeAction.name === SwapActionKind.REDEEM &&
          containsEvent(events, SwapEventName.HERC20_DEPLOYED) &&
          containsEvent(events, SwapEventName.HERC20_FUNDED) &&
          containsEvent(events, SwapEventName.HBIT_FUNDED) &&
          containsEvent(events, SwapEventName.HBIT_REDEEMED) &&
          !containsEvent(events, SwapEventName.HERC20_REDEEMED)
        );
      default:
        return false;
    }
  } else {
    switch (swapStep) {
      case SwapStepName.HBIT_HERC20_ALICE_FUND:
        return (
          !activeAction && !containsEvent(events, SwapEventName.HBIT_FUNDED)
        );
      case SwapStepName.HBIT_HERC20_BOB_DEPLOY:
        return (
          activeAction &&
          activeAction.name === SwapActionKind.DEPLOY &&
          containsEvent(events, SwapEventName.HBIT_FUNDED) &&
          !containsEvent(events, SwapEventName.HERC20_DEPLOYED)
        );
      case SwapStepName.HBIT_HERC20_BOB_FUND:
        return (
          activeAction &&
          activeAction.name === SwapActionKind.FUND &&
          containsEvent(events, SwapEventName.HBIT_FUNDED) &&
          containsEvent(events, SwapEventName.HERC20_DEPLOYED) &&
          !containsEvent(events, SwapEventName.HERC20_FUNDED)
        );
      case SwapStepName.HBIT_HERC20_ALICE_REDEEM:
        return (
          containsEvent(events, SwapEventName.HBIT_FUNDED) &&
          containsEvent(events, SwapEventName.HERC20_DEPLOYED) &&
          containsEvent(events, SwapEventName.HERC20_FUNDED) &&
          !containsEvent(events, SwapEventName.HERC20_REDEEMED)
        );
      case SwapStepName.HBIT_HERC20_BOB_REDEEM:
        return (
          activeAction &&
          activeAction.name === SwapActionKind.REDEEM &&
          containsEvent(events, SwapEventName.HBIT_FUNDED) &&
          containsEvent(events, SwapEventName.HERC20_DEPLOYED) &&
          containsEvent(events, SwapEventName.HERC20_FUNDED) &&
          containsEvent(events, SwapEventName.HERC20_REDEEMED) &&
          !containsEvent(events, SwapEventName.HBIT_REDEEMED)
        );
      default:
        return false;
    }
  }
}

function isSwapStepActive(
  swapStep: SwapStepName,
  alphaProtocol: Protocol,
  state: State,
  swap: SwapProperties,
  role: Role
) {
  if (role === Role.ALICE) {
    return isSwapStepActiveForAlice(swapStep, alphaProtocol, state, swap);
  }

  return isSwapStepActiveForBob(swapStep, alphaProtocol, state, swap);
}

function isLedgerInteractionButtonActive(
  swapStep: SwapStepName,
  alphaProtocol: Protocol,
  state: State,
  swap: SwapProperties,
  role: Role
): boolean {
  return (
    isSwapStepActive(swapStep, alphaProtocol, state, swap, role) &&
    state.activeActionStatus === ActionStatus.AWAITING_USER_INTERACTION
  );
}
