import React, {useEffect, useState} from 'react';
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
  Text,
  Tooltip
} from '@chakra-ui/core';
import {RiExchangeLine} from 'react-icons/ri';
import {useEthereumWallet} from '../hooks/useEthereumWallet';
import {useBitcoinWallet} from '../hooks/useBitcoinWallet';
import CurrencyAmount from './CurrencyAmount';
import {mockSwap} from './MockData';
import {Currency} from '../utils/types';
import {Action} from "../comit-sdk/cnd/siren";

enum Role {
  ALICE = 'Alice',
  BOB = 'Bob'
}

enum Event {
  HERC20_DEPLOYED = 'herc20_deployed',
  HERC20_FUNDED = 'herc20_funded',
  HERC20_REDEEMED = 'herc20_redeemed',
  HERC20_REFUNDED = 'herc20_refunded',
  HBIT_FUNDED = 'hbit_funded',
  HBIT_REDEEMED = 'hbit_redeemed',
  HBIT_REFUNDED = 'hbit_refunded'
}

enum Protocol {
  HBIT = 'hbit',
  HER20 = 'herc20'
}

type SwapEvent = {
  name: Event,
  seen_at: string,
  tx: string
}

type Asset = {
  currency: Currency,
  value: string,
  decimals: number,
}

type ProtocolParams = {
  protocol: Protocol,
  asset: Asset
}

type Swap = {
  role: Role,
  alpha: ProtocolParams,
  beta: ProtocolParams
  events: SwapEvent[]
  actions: Action[]
}

export interface SwapProperties {
  href: string;
}

function eventLabel(event: Event): string {
  switch (event) {
    case Event.HERC20_DEPLOYED:
      return "DAI LOCK 1/2";
    case Event.HERC20_FUNDED:
      return "DAI LOCK 2/2";
    case Event.HERC20_REDEEMED:
      return "DAI UNLOCK 1/2";
    case Event.HERC20_REFUNDED:
      return "DAI REFUND 1/2";
    case Event.HBIT_FUNDED:
      return "BITCOIN LOCK";
    case Event.HBIT_REDEEMED:
      return "BITCOIN UNLOCK";
    case Event.HBIT_REFUNDED:
      return "BITCOIN REFUND";
    default:
      return "unknown";
  }
}

// TODO: Include network!
function getBlockchainExplorerUrl(event: Event): string {
  switch (event) {
    case Event.HERC20_DEPLOYED:
    case Event.HERC20_FUNDED:
    case Event.HERC20_REDEEMED:
    case Event.HERC20_REFUNDED:
      return "https://etherscan.io/tx/";
    case Event.HBIT_FUNDED:
    case Event.HBIT_REDEEMED:
    case Event.HBIT_REFUNDED:
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
        <ListItem>
          <Flex direction="row" alignItems="center">
            <ListIcon icon="check-circle" color="green.500" />
            <Badge>{label}</Badge>
            <Text marginLeft="0.5rem">{`at ${timestamp.toLocaleString()} with id`}</Text>
            <Link href={`${getBlockchainExplorerUrl(event.name)}${txId}`} isExternal marginLeft="0.5rem" color="teal.500">
              {txId}
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

export default function Swap({ href }: SwapProperties) {
  const [executedActions, setExecutedActions] = useState([]);

  const { wallet: ethWallet } = useEthereumWallet();
  const { wallet: btcWallet } = useBitcoinWallet();
  // const { cnd } = useCnd();

  const response = mockSwap(href, 'fund').data;
  const swap: Swap = {
    role: response.properties.role,
    alpha: response.properties.alpha,
    beta: response.properties.beta,
    events: response.properties.events,
    actions: response.actions,
  };

  // TODO: Production code
  // const { data: swap } = useSWR<AxiosResponse<SwapResponse>>(
  //     () => href,
  //     path => cnd.fetch(path),
  //     {
  //       refreshInterval: 1000,
  //       dedupingInterval: 0,
  //       compare: () => false
  //     }
  // );

  useEffect(() => {
    console.log(swap);

    // Wallet guard
    if (!ethWallet || !btcWallet) {
      return;
    }
    // Swap has one action available guard
    const swapHasExactlyOneAction =
      swap && swap.actions && swap.actions.length === 1;
    if (!swapHasExactlyOneAction) {
      return;
    }
    const action = swap.actions[0];
    // Don't trigger action twice guard
    if (executedActions.includes(action.href)) {
      return;
    }

    // TODO: Production code
    // executeLedgerAction(action, cnd, {
    //   bitcoin: BTCWallet,
    //   ethereum: ETHWallet
    // })
    //   .then(console.log)
    //   .catch(console.error);

    setExecutedActions([...executedActions, action.href]);
  }, [swap]);

  if (!swap) {
    return <Box />;
  }

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
          <Tooltip aria-label="confirm-ledger-tx" label="Click to confirm tx with ledger Nano S" placement="top" hasArrow bg="pink.600">
            <Button
                // @ts-ignore
              leftIcon="ledger"
              onClick={handleDetailsToggle}
              minWidth="120px"
              variantColor="pink"
            >
              Lock (1/2)
            </Button>
          </Tooltip>
        </Flex>
        <Collapse mt={4} isOpen={show}>
          <SwapEventList swapEvents={swap.events} />
        </Collapse>
      </Flex>
    </Box>
  );
}
