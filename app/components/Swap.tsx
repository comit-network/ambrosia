import React, { useEffect, useState } from 'react';
import { Box, Button, Collapse, Flex, IconButton, Text } from '@chakra-ui/core';
import { RiExchangeLine } from 'react-icons/ri';
import { useEthereumWallet } from '../hooks/useEthereumWallet';
import { useBitcoinWallet } from '../hooks/useBitcoinWallet';
import { useCnd } from '../hooks/useCnd';
import CurrencyAmount, { Currency, CurrencyUnit } from './CurrencyAmount';
import { buyMockSwap } from './MockData';

const swapStatus = (alphaStatus: string, betaStatus: string) => {
  // TODO: Work on more elaborate status
};

export interface SwapProperties {
  href: string;
}

export default function Swap({ href }: SwapProperties) {
  const [executedActions, setExecutedActions] = useState([]);

  const { wallet: ethWallet, loaded: ethLoaded } = useEthereumWallet();
  const { wallet: btcWallet, loaded: btcLoaded } = useBitcoinWallet();
  const { cnd } = useCnd();

  const swap = buyMockSwap(href, 'fund');
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
    if (!ethLoaded || !btcLoaded) {
      return;
    }
    // Swap has one action available guard
    const swapHasExactlyOneAction =
      swap && swap.data.actions && swap.data.actions.length === 1;
    if (!swapHasExactlyOneAction) {
      return;
    }
    const action = swap.data.actions[0];
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

  const { role } = swap.data.properties;

  const alphaParams = swap.data.entities.find(
    entity => entity.class[0] === 'parameters' && entity.rel[0] === 'alpha'
  );
  if (!alphaParams) {
    // TODO proper error handling
    return (
      <Text color="red">
        Error: could not properly deserialize alpha params
      </Text>
    );
  }

  const betaParams = swap.data.entities.find(
    entity => entity.class[0] === 'parameters' && entity.rel[0] === 'beta'
  );
  if (!betaParams) {
    return (
      <Text color="red">Error: could not properly deserialize beta params</Text>
    );
  }

  // TODO: Properly use types (not just Siren Entity) once we agree on API changes
  if (role === 'Alice') {
    sendAmount = alphaParams.properties.quantity;
    sendCurrency =
      alphaParams.properties.protocol === 'hbit' ? Currency.BTC : Currency.DAI;
    receiveAmount = betaParams.properties.quantity;
    receiveCurrency =
      betaParams.properties.protocol === 'hbit' ? Currency.BTC : Currency.DAI;
  } else {
    receiveAmount = alphaParams.properties.quantity;
    receiveCurrency =
      alphaParams.properties.protocol === 'hbit' ? Currency.BTC : Currency.DAI;
    sendAmount = betaParams.properties.quantity;
    sendCurrency =
      betaParams.properties.protocol === 'hbit' ? Currency.BTC : Currency.DAI;
  }

  const sendAmountLabel = 'You send';
  const receiveAmountLabel = 'You receive';
  const numberShortenPos = 6;

  const sendAmountDisplay =
    sendCurrency === Currency.BTC ? (
      <CurrencyAmount
        amount={sendAmount}
        currency={Currency.BTC}
        unit={CurrencyUnit.SATOSHI}
        topText={sendAmountLabel}
        amountShortenPosition={numberShortenPos}
      />
    ) : (
      <CurrencyAmount
        amount={sendAmount}
        currency={Currency.DAI}
        unit={CurrencyUnit.ATTO}
        topText={sendAmountLabel}
        amountShortenPosition={numberShortenPos}
      />
    );

  const receiveAmountDisplay =
    receiveCurrency === Currency.BTC ? (
      <CurrencyAmount
        amount={receiveAmount}
        currency={Currency.BTC}
        unit={CurrencyUnit.SATOSHI}
        topText={receiveAmountLabel}
        amountShortenPosition={numberShortenPos}
      />
    ) : (
      <CurrencyAmount
        amount={receiveAmount}
        currency={Currency.DAI}
        unit={CurrencyUnit.ATTO}
        topText={receiveAmountLabel}
        amountShortenPosition={numberShortenPos}
      />
    );

  return (
    <Box maxWidth="100%" padding="5px">
      <Flex direction="column" shadow="md">
        <Flex
          direction="row"
          width="100%"
          alignItems="center"
          padding="5px"
          justifyContent="space-between"
        >
          <Box as={RiExchangeLine} size="32px" />
          {/* <Spinner size="sm" marginLeft="10px" marginRight="20px"/> */}
          <Text fontSize="md" marginRight="20px" fontWeight="bold">
            Swap
          </Text>
          {sendAmountDisplay}
          {receiveAmountDisplay}
          <IconButton
            aria-label="Swap Details"
            icon={show ? 'chevron-up' : 'chevron-down'}
            onClick={handleDetailsToggle}
            marginRight="20px"
          >
            Show details
          </IconButton>
          {/* @ts-ignore */}
          <Button leftIcon="ledger" onClick={handleDetailsToggle}>
            Fund
          </Button>
        </Flex>
        <Collapse mt={4} isOpen={show}>
          <Text>
            TODO Work on swap details - What was the original price (order
            mapping?), list of events, tx hashes
          </Text>
        </Collapse>
      </Flex>
    </Box>
  );
}
