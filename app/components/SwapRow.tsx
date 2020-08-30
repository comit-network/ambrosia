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
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Tag,
  TagIcon,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/core';
import {RiExchangeLine, RiFileSettingsLine, RiLockLine, RiLockUnlockLine} from 'react-icons/ri';
import {useEthereumWallet} from '../hooks/useEthereumWallet';
import {useBitcoinWallet} from '../hooks/useBitcoinWallet';
import CurrencyAmount from './CurrencyAmount';
import {mockSwap} from './MockData';
import {Currency} from '../utils/currency';
import {Action, Protocol, Role, Swap, SwapAction, SwapEvent, SwapEventName} from "../utils/swap";

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

function swapEventToSwapAction(swapEvent: SwapEvent): SwapAction {
  switch (swapEvent.name) {
    case SwapEventName.HERC20_DEPLOYED:
      return SwapAction.DEPLOY;
    case SwapEventName.HERC20_FUNDED:
      return SwapAction.FUND;
    case SwapEventName.HERC20_REDEEMED:
      return SwapAction.REDEEM;
    case SwapEventName.HERC20_REFUNDED:
      break;
    case SwapEventName.HBIT_FUNDED:
      break;
    case SwapEventName.HBIT_REDEEMED:
      break;
    case SwapEventName.HBIT_REFUNDED:
      break;
  }
}

function actionLabel(action: SwapAction, protocol: Protocol): string {

  // TODO: Evaluate of it is better to include the asset that is Locked/Unlocked/Refunded

  switch (action) {
    case SwapAction.DEPLOY:
          return "Lock (1/2)";
    case SwapAction.FUND:
      if (protocol === Protocol.HBIT) {
        return "Lock";
      } else {
        return "Lock (2/2)";
      }
    case SwapAction.REDEEM:
      return "Unlock";
    case SwapAction.REFUND:
      return "Refund";
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
  onClick: () => void;
  active: boolean
}

function LedgerInteractionButton({active, onClick}: LedgerInteractionButtonProperties) {
  let tooltip = "Please wait until you can confirm with Ledger Nano S";
  let styles;

  if (active) {
    styles = "button ledger pink";
    tooltip = "Click to confirm tx with ledger Nano S"
  }

  return (
      <Tooltip aria-label="confirm-ledger-tx" label={tooltip} placement="top"
               hasArrow bg="pink.600">
        <IconButton
            // @ts-ignore
            icon="ledger"
            onClick={onClick}
            variantColor="pink"
            className={styles}
            isDisabled={!active}
            roundedLeft={0}
        />
      </Tooltip>
  );
}

enum ComponentActionType {
  FETCHED_SWAP= "fetchedSwap"
}

type ComponentAction = {
  type: ComponentActionType.FETCHED_SWAP,
  value: Swap
};

enum ActionState {
  AWAITING_USER_INTERACTION, // for actions that require user interaction
  READY_FOR_EXECUTION, // for actions that don't require user interaction
  TRYING_TO_EXECUTE,
  WAITING_CONFIRMATION,
  CONFIRMED
}

interface State {
  swap: Swap;
  alreadySeenActions: Action[]; // needed becaus cnd keeps returning actions that were already "processed" but cnd did not pick up the blockchain transaction yet
  activeAction: Action; // the action currently being processed, there can only be one.
  activeActionState: ActionState; // the state of the action currently being processed.
}

function actionToInitialState(action: SwapAction, protocol: Protocol): ActionState {
  if (protocol === Protocol.HER20 && (
      action === SwapAction.DEPLOY
      || action === SwapAction.FUND)) {
    return ActionState.AWAITING_USER_INTERACTION;
  }

  if (protocol === Protocol.HBIT && (
      action === SwapAction.FUND
      || action === SwapAction.REDEEM)) {
    return ActionState.AWAITING_USER_INTERACTION;
  }

  return ActionState.READY_FOR_EXECUTION;
}

function reducer(state: State, action: ComponentAction): State {
  switch (action.type) {
    case ComponentActionType.FETCHED_SWAP:

      let swap = action.value;
      let newSwap = state.swap;

      // if the swap known to the state was not set yet, then use the incoming swap
      if (state.swap === null) {
        newSwap = swap
      }

      // if swap undefined nothing to do
      if (!newSwap) {
        return state;
      }

      // if no action available, set swap, nothing else to do
      if (!newSwap.action) {
        return {
          ...state,
          swap: newSwap,
        }
      }

      console.log(swap.action.name);

      let actionAlreadySeen = state.alreadySeenActions.find((action) => action === swap.action);

      // if action already known, set swap, nothing else to do
      if (actionAlreadySeen) {
        return {
          ...state,
          swap: newSwap,
        }
      }

      let newActiveAction = swap.action;
      let newAlreadySeenActions = state.alreadySeenActions;
      newAlreadySeenActions.push(newActiveAction);

      console.log("initial state: " + actionToInitialState(newActiveAction.name, swap.alpha.protocol));

      return {
          ...state,
        swap: newSwap,
        alreadySeenActions: newAlreadySeenActions,
        activeAction: newActiveAction,
        activeActionState: actionToInitialState(newActiveAction.name, swap.alpha.protocol)
      };
    default:
      throw new Error();
  }
}

export default function SwapRow({ href }: SwapProperties) {

  const [swapResponse, setSwapResponse] = useState(mockSwap(href, 'fund').data);

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
    activeAction: null,
    activeActionState: null,
    alreadySeenActions: [],
    swap: null

  };

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // TODO: Is in righ place?
    if (!ethWallet || !btcWallet) {
      return;
    }

    const swap: Swap = {
      action: swapResponse.actions[0] as Action,
      alpha: swapResponse.properties.alpha,
      beta: swapResponse.properties.beta,
      events: swapResponse.properties.events,
      role: swapResponse.properties.role

    }

    dispatch({type: ComponentActionType.FETCHED_SWAP, value: swap});

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

  // TODO: Move this out
  const { isOpen, onOpen, onClose } = useDisclosure();
  const LedgerStatusModal = () => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay/>
          <ModalContent>
            <ModalHeader>Confirm TX</ModalHeader>
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

  if (!state.swap) {
    return <Text>Loading</Text>;
  }

  // TODO: At the moment we assume that we have a HERC20-HBIT swap, add HBIT-HERC20 later.

  interface SwapStatusProperties {
    protocol: Protocol
  }
  interface NumberProperties {
    nr: number
  }

  const iconSize = "20px";
  const LockIcon = () => <Box as={RiLockLine} size={iconSize} marginLeft="0.3rem"/>;
  const UnlockIcon = () => <Box as={RiLockUnlockLine} size={iconSize} marginLeft="0.3rem"/>;
  const ContractSetupIcon = () => <Box as={RiFileSettingsLine} size={iconSize} marginLeft="0.3rem"/>;
  const Check = () => <TagIcon icon="check" />;

  const Number = ({nr}: NumberProperties) => {
    return (
          <TagLabel textAlign="center">{`${nr}.`}</TagLabel>
    );
  };

  const SwapStatus = ({protocol}: SwapStatusProperties) => {

    // TODO Only display the Current Step in the swap row
    // Move the complete steps inside and link the TX to them.

    // TODO change Tag colour Variant according to
    if (protocol === Protocol.HER20) {
      return (
          <Stack direction="row" spacing={5} align="center">
            <Box>
              <Popover trigger="hover">
                <PopoverTrigger>
                  <Flex direction={"row"}>
                    <Tag variantColor="pink" roundedRight={0}>
                      {/*<Check />*/}
                      {/*<Number nr={1}/>*/}
                      <ContractSetupIcon />
                      <TagIcon size={iconSize} icon="dai" />
                    </Tag>
                    <LedgerInteractionButton
                                             active={
                                               state.activeAction.name === SwapAction.DEPLOY
                                               && state.activeActionState === ActionState.AWAITING_USER_INTERACTION}
                                             onClick={() => {
                                               // TODO: trigger ledger with action
                                               onOpen();
                                             }
                                             }
                    />
                  </Flex>
                </PopoverTrigger>
                <PopoverContent zIndex={4} backgroundColor="pink.100">
                  <PopoverArrow />
                  <PopoverHeader>You Lock DAI (1/2)</PopoverHeader>
                  <PopoverCloseButton />
                  <PopoverBody>
                    <Text>For locking DAI there are two steps.</Text>
                  </PopoverBody>
                  {/*<PopoverFooter>Do we need a Footer?</PopoverFooter>*/}
                </PopoverContent>
              </Popover>
            </Box>
            <Flex direction="row">
              <Tag variantColor="pink" roundedRight={0}>
                {/*<Number nr={2} />*/}
                <LockIcon />
                <TagIcon size={iconSize} icon="dai" />
              </Tag>
              <LedgerInteractionButton
                                       active={
                                         state.activeAction.name === SwapAction.FUND
                                         && state.activeActionState === ActionState.AWAITING_USER_INTERACTION}
                                       onClick={() => {
                                         // TODO: trigger ledger with action
                                         onOpen();
                                       }
                                       }
              />
            </Flex>
            <Box>
              <Tag variantColor="purple">
                {/*<Number nr={3} />*/}
                <LockIcon />
                <TagIcon icon="bitcoin" size={iconSize} />
              </Tag>
            </Box>
            <Box>
              <Tag variantColor="pink">
                {/*<Number nr={4} />*/}
                <UnlockIcon />
                <TagIcon icon="bitcoin" size={iconSize} />
              </Tag>
            </Box>
          </Stack>
      );
    } else {
      return (
          <Stack isInline spacing={5} align="center">
            <Box>
              <LedgerInteractionButton
                                       active={
                                         state.activeAction.name === SwapAction.FUND
                                         && state.activeActionState === ActionState.AWAITING_USER_INTERACTION}
                                       onClick={() => {
                                         // TODO: trigger ledger with action
                                         onOpen();
                                       }
                                       }
              />
            </Box>
            <Box>
              <Tag variantColor="purple">
                <TagIcon icon="add" size="12px" />
                <TagIcon icon="check" size="12px" />
              </Tag>
            </Box>
            <Box>
              <LedgerInteractionButton label={"Unlock DAI"}
                                       active={
                                         state.activeAction.name === SwapAction.REDEEM
                                         && state.activeActionState === ActionState.AWAITING_USER_INTERACTION}
                                       onClick={() => {
                                         // TODO: trigger ledger with action
                                         onOpen();
                                       }
                                       }
              />
            </Box>
          </Stack>
      );
    }


  }

  return (
    <Box maxWidth="100%" border="1px" borderColor="gray.400" backgroundColor="gray.100" marginTop="0.5rem" rounded="lg">
      <Flex direction="column">
        <Flex
          direction="row"
          alignItems="center"
          padding="0.5rem"
        >
          <Box as={RiExchangeLine} height="45px" marginRight="0.5rem" />
          {/* <Spinner size="sm" marginLeft="10px" marginRight="20px"/> */}
          <Text fontSize="md" marginRight="20px" fontWeight="bold">
            Swap
          </Text>
          <Flex marginRight="20px">{sendAmountDisplay}</Flex>
          <Flex>{receiveAmountDisplay}</Flex>
          <Flex width="100%" />
          <SwapStatus protocol={swap.alpha.protocol} />
          <IconButton
            aria-label="Swap Details"
            icon={show ? 'chevron-up' : 'chevron-down'}
            onClick={handleDetailsToggle}
          >
            Show details
          </IconButton>
        </Flex>
        <Collapse mt={4} isOpen={show}>
          <SwapEventList swapEvents={swap.events} />
        </Collapse>
      </Flex>
      <LedgerStatusModal />
    </Box>
  );
}
