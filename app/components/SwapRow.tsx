import React, {useEffect, useReducer, useState} from 'react';
import {
  Badge,
  Box,
  Button,
  Collapse,
  Flex,
  Icon,
  IconButton,
  Link,
  List,
  ListIcon,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/core';
import {RiExchangeLine} from 'react-icons/ri';
import {useEthereumWallet} from '../hooks/useEthereumWallet';
import {useBitcoinWallet} from '../hooks/useBitcoinWallet';
import CurrencyAmount from './CurrencyAmount';
import {mockSwap} from './MockData';
import {Currency} from '../utils/currency';
import {Action} from "../comit-sdk/cnd/siren";
import {Protocol, Role, Swap, SwapEvent, SwapEventName} from "../utils/swap";

enum LedgerAction {
  DEPLOY = "deploy",
  FUND = "fund",
  REDEEM = "redeem",
  REFUND = "refund"
}

export interface SwapProperties {
  href: string;
}

function eventLabel(event: SwapEventName): string {
  switch (event) {
    case SwapEventName.HERC20_DEPLOYED:
      return "DAI LOCK 1/2";
    case SwapEventName.HERC20_FUNDED:
      return "DAI LOCK 2/2";
    case SwapEventName.HERC20_REDEEMED:
      return "DAI UNLOCK 1/2";
    case SwapEventName.HERC20_REFUNDED:
      return "DAI REFUND 1/2";
    case SwapEventName.HBIT_FUNDED:
      return "BITCOIN LOCK";
    case SwapEventName.HBIT_REDEEMED:
      return "BITCOIN UNLOCK";
    case SwapEventName.HBIT_REFUNDED:
      return "BITCOIN REFUND";
    default:
      return "unknown";
  }
}

// TODO: Include network!
function getBlockchainExplorerUrl(event: SwapEventName): string {
  switch (event) {
    case SwapEventName.HERC20_DEPLOYED:
    case SwapEventName.HERC20_FUNDED:
    case SwapEventName.HERC20_REDEEMED:
    case SwapEventName.HERC20_REFUNDED:
      return "https://etherscan.io/tx/";
    case SwapEventName.HBIT_FUNDED:
    case SwapEventName.HBIT_REDEEMED:
    case SwapEventName.HBIT_REFUNDED:
    default:
      return "https://www.blockchain.com/btc/tx/";
  }
}

interface SwapEventListProperties {
  swapEvents: SwapEvent[]
}

function SwapEventList({swapEvents}: SwapEventListProperties) {

  let eventListItems = swapEvents.map((event) => {

    const timestamp = new Date(event.seen_at);
    const label = eventLabel(event.name);
    const txId = event.tx;

    return (
        // TODO: unique key - how to properly achieve that here?
        <ListItem>
          <Flex direction="row" alignItems="center">
            <ListIcon icon="check-circle" color="green.500" />
            <Badge>{label}</Badge>
            <Text marginLeft="0.5rem">{`at ${timestamp.toLocaleString()} with id`}</Text>
            <Link href={`${getBlockchainExplorerUrl(event.name)}${txId}`} isExternal marginLeft="0.5rem" color="teal.500">
              {`${txId.substring(0, 10)}...`}
              <Icon name="external-link" mx="2px" />
            </Link>
          </Flex>
        </ListItem>
    );
  });

  return (
      <List spacing={1} paddingRight="1rem" paddingLeft="1rem" paddingBottom="1rem">
        {eventListItems}
      </List>
  );
}

interface LedgerInteractionButtonProperties {
  state: LedgerButtonState;
  // TODO: Probably pre-prepare in Reducer...?
  action?: Action;
}

// TODO: might need more state
function LedgerInteractionButton({state, action}: LedgerInteractionButtonProperties) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const activeTooltip = "Click to confirm tx with ledger Nano S";

  const activeButton = (label: string) => {
    return (
        <Tooltip aria-label="confirm-ledger-tx" label={activeTooltip} placement="top"
                 hasArrow bg="pink.600">
          <Button
              // @ts-ignore
              leftIcon="ledger"
              onClick={() => {
                // TODO: Deal with ledger device communication here; use action (...)
                onOpen();
              }}
              minWidth="120px"
              variantColor="pink"
              className="button ledger pink"
          >
            {label}
          </Button>
        </Tooltip>
    );
  };

  const inactiveButton = (label: string, tooltip: string) => {
    return (
        <Tooltip aria-label="wait-ledger-tx" label={tooltip} placement="top"
                 hasArrow bg="gray.600">
          <Button
              // @ts-ignore
              leftIcon="ledger"
              minWidth="120px"
              isDisabled
          >
            {label}
          </Button>
        </Tooltip>
    );
  }

  const ledgerStatusModal = (header: string) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay/>
          <ModalContent>
            <ModalHeader>{}</ModalHeader>
            <ModalCloseButton/>
            <ModalBody>
              <Text>Connecting to Ledger device...</Text>
            </ModalBody>

            <ModalFooter>
              <Button variantColor="blue" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    );
  };

  switch (state) {
    case LedgerButtonState.AWAITING_FUNDING:
      return (
          <>
            {inactiveButton("Lock", "Please wait until you can lock.")}
          </>
      );
    case LedgerButtonState.HERC20_DEPLOY:
      return (
          <>
            {activeButton("Lock (1/2)")}
            {ledgerStatusModal("Confirm DAI Locking TX (1/2)")}
          </>
      );
    case LedgerButtonState.HERC20_FUND:
      return (
          <>
            {activeButton("Lock (2/2)")}
            {ledgerStatusModal("Confirm DAI Locking TX (2/2)")}
          </>
      );
    case LedgerButtonState.HBIT_FUND:
      return (
          <>
            {activeButton("Lock")}
            {ledgerStatusModal("Confirm BTC Locking TX")}
          </>
      );
    case LedgerButtonState.AWAITING_REDEEMING:
      return (
          <>
            {inactiveButton("Unlock", "Please wait until you can unlock.")}
          </>
      );
    case LedgerButtonState.HERC20_REDEEM:
      return (
          <>
            {activeButton("Unlock")}
            {ledgerStatusModal("Confirm DAI Unlocking TX")}
          </>
      );
    case LedgerButtonState.NO_BUTTON:
    default:
      return (<></>);

  }
}

type ComponentAction = {
  type: 'swapAction',
  value: Action
};

enum LedgerButtonState {
  AWAITING_FUNDING,
  HERC20_DEPLOY,
  HERC20_FUND,
  HBIT_FUND,
  AWAITING_REDEEMING,
  HERC20_REDEEM,
  NO_BUTTON,
}

interface State {
  swap: Swap;
  alreadySeenActions: Action[];
  actionThatRequiresLedgerInteraction: Action;
  ledgerButtonState: LedgerButtonState
}

function reducer(state: State, action: ComponentAction): State {
  switch (action.type) {
    case "swapAction":

      let swapAction = action.value;
      let isActionAlreadySeen = state.alreadySeenActions.find((a) => a === swapAction);
      if (isActionAlreadySeen) {
        // no changes
        return state;
      }

      let alreadySeenActions = state.alreadySeenActions;
      alreadySeenActions.push(swapAction);

      // TODO: case: fund already seen -> wait for redeem (for herc20)

      if (state.swap.alpha.protocol === Protocol.HBIT) {
        if (swapAction.name === LedgerAction.FUND) {
          return {
              ...state,
              actionThatRequiresLedgerInteraction: swapAction,
              alreadySeenActions: alreadySeenActions,
              ledgerButtonState: LedgerButtonState.HBIT_FUND
          };
        } else if (swapAction.name === LedgerAction.REDEEM) {
          return {
            ...state,
            actionThatRequiresLedgerInteraction: swapAction,
            alreadySeenActions: alreadySeenActions,
            ledgerButtonState: LedgerButtonState.HERC20_REDEEM
          };
        }
      } else {
        if (swapAction.name === LedgerAction.DEPLOY) {
          return {
            ...state,
            actionThatRequiresLedgerInteraction: swapAction,
            alreadySeenActions: alreadySeenActions,
            ledgerButtonState: LedgerButtonState.HERC20_DEPLOY
          };
        } else if (swapAction.name === LedgerAction.FUND) {
          return {
            ...state,
            actionThatRequiresLedgerInteraction: swapAction,
            alreadySeenActions: alreadySeenActions,
            ledgerButtonState: LedgerButtonState.HERC20_FUND
          };
        }
      }

      return {
          ...state,
          alreadySeenActions: alreadySeenActions,
          ledgerButtonState: LedgerButtonState.NO_BUTTON
      };
    default:
      throw new Error();
  }
}

export default function SwapRow({ href }: SwapProperties) {

  const [swapResponse, setSwapResponse] = useState(mockSwap(href, 'deploy').data);

  // TODO: Production code
  // const { data: swapResponse } = useSWR<AxiosResponse<SwapResponse>>(
  //     () => href,
  //     path => cnd.fetch(path),
  //     {
  //       refreshInterval: 1000,
  //       dedupingInterval: 0,
  //       compare: () => false
  //     }
  // );

  const { wallet: ethWallet } = useEthereumWallet();
  const { wallet: btcWallet } = useBitcoinWallet();
  // const { cnd } = useCnd();

  const swap = swapResponse.properties as Swap;

  const initialState: State = {
    swap: swap,
    ledgerButtonState: LedgerButtonState.AWAITING_FUNDING,
    alreadySeenActions: [],
    actionThatRequiresLedgerInteraction: null
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Wallet guard
    if (!ethWallet || !btcWallet) {
      return;
    }
    // Swap has one action available guard
    const swapHasExactlyOneAction =
      swap && swapResponse.actions && swapResponse.actions.length === 1;
    if (!swapHasExactlyOneAction) {
      return;
    }
    const action = swapResponse.actions[0];
    dispatch({type: "swapAction", value: action});

    // TODO: This must go somewhere after Ledger Interaction was triggered successfully!
    // executeLedgerAction(action, cnd, {
    //   bitcoin: BTCWallet,
    //   ethereum: ETHWallet
    // })
    //   .then(console.log)
    //   .catch(console.error);
  }, [swapResponse]);

  const [show, setShow] = React.useState(false);
  const handleDetailsToggle = () => setShow(!show);

  let sendAmount;
  let sendCurrency;
  let receiveAmount;
  let receiveCurrency;

  let alpha = swap.alpha;
  let beta = swap.beta;

  if (swap.role === Role.ALICE) {
    sendAmount = alpha.asset;
    sendCurrency = alpha.protocol === Protocol.HBIT ? Currency.BTC : Currency.DAI;
    receiveAmount = beta.asset;
    receiveCurrency = beta.protocol === Protocol.HBIT ? Currency.BTC : Currency.DAI;
  } else {
    receiveAmount = alpha.asset;
    receiveCurrency = alpha.protocol === Protocol.HBIT ? Currency.BTC : Currency.DAI;
    sendAmount = beta.asset;
    sendCurrency = beta.protocol === Protocol.HBIT ? Currency.BTC : Currency.DAI;
  }

  const sendAmountLabel = 'You send';
  const receiveAmountLabel = 'You receive';

  const sendAmountDisplay =
    sendCurrency === Currency.BTC ? (
      <CurrencyAmount
        currencyValue={sendAmount}
        topText={sendAmountLabel}
      />
    ) : (
      <CurrencyAmount
        currencyValue={sendAmount}
        topText={sendAmountLabel}
      />
    );

  const receiveAmountDisplay =
    receiveCurrency === Currency.BTC ? (
      <CurrencyAmount
        currencyValue={receiveAmount}
        topText={receiveAmountLabel}
      />
    ) : (
      <CurrencyAmount
        currencyValue={receiveAmount}
        topText={receiveAmountLabel}
      />
    );

  return (
    <Box maxWidth="100%" border="1px" borderColor="gray.400" backgroundColor="gray.100" marginTop="0.5rem" rounded="lg">
      <Flex direction="column">
        <Flex
          direction="row"
          alignItems="center"
          padding="0.5rem"
        >
          <Box as={RiExchangeLine} size="45px" marginRight="0.5rem" />
          {/* <Spinner size="sm" marginLeft="10px" marginRight="20px"/> */}
          <Text fontSize="md" marginRight="20px" fontWeight="bold">
            Swap
          </Text>
          <Flex marginRight="20px">{sendAmountDisplay}</Flex>
          <Flex>{receiveAmountDisplay}</Flex>
          <Flex width="100%" />
          <IconButton
            aria-label="Swap Details"
            icon={show ? 'chevron-up' : 'chevron-down'}
            onClick={handleDetailsToggle}
            marginRight="20px"
          >
            Show details
          </IconButton>
          <LedgerInteractionButton state={state.ledgerButtonState} action={state.actionThatRequiresLedgerInteraction} />
        </Flex>
        <Collapse mt={4} isOpen={show}>
          <SwapEventList swapEvents={swap.events} />
        </Collapse>
      </Flex>
    </Box>
  );
}
