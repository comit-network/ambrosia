import React, { useEffect, useState } from 'react';
import { Box, Button, Collapse, Flex, IconButton, Text } from '@chakra-ui/core';
import { RiExchangeLine } from 'react-icons/ri';
import { useEthereumWallet } from '../hooks/useEthereumWallet';
import { useBitcoindWallet } from '../hooks/useBitcoindWallet';
import { useCnd } from '../hooks/useCnd';
import CurrencyAmount from './CurrencyAmount';
import { mockSwap } from './MockData';
import { Currency } from '../utils/types';
import { useLedgerBitcoinWallet } from '../hooks/useLedgerBitcoinWallet';

const swapStatus = (alphaStatus: string, betaStatus: string) => {
  // TODO: Work on more elaborate status
};

export interface SwapProperties {
  href: string;
}

export default function Swap({ href }: SwapProperties) {
  const [executedActions, setExecutedActions] = useState([]);

  const { wallet: ethWallet, loaded: ethLoaded } = useEthereumWallet();
  const { wallet: btcWallet, loaded: btcLoaded } = useBitcoindWallet();
  const { cnd } = useCnd();
  const ledgerBitcoinWallet = useLedgerBitcoinWallet();

  const swap = mockSwap(href, 'fund');
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
    return <Box/>;
  }

  const [show, setShow] = React.useState(false);
  const handleDetailsToggle = () => setShow(!show);

  let sendAmount;
  let sendCurrency;
  let receiveAmount;
  let receiveCurrency;

  const { role } = swap.data.properties;

  const { alpha } = swap.data.properties;
  if (!alpha) {
    // TODO proper error handling
    return (
      <Text color="red">
        Error: could not properly deserialize alpha params
      </Text>
    );
  }

  const { beta } = swap.data.properties;
  if (!beta) {
    return (
      <Text color="red">Error: could not properly deserialize beta params</Text>
    );
  }

  // TODO: Properly use types (not just Siren Entity) - might require adding "Asset" to be accepted by <CurrencyAmount />
  if (role === 'Alice') {
    sendAmount = alpha.asset;
    sendCurrency = alpha.protocol === 'hbit' ? Currency.BTC : Currency.DAI;
    receiveAmount = beta.asset;
    receiveCurrency = beta.protocol === 'hbit' ? Currency.BTC : Currency.DAI;
  } else {
    receiveAmount = alpha.asset;
    receiveCurrency = alpha.protocol === 'hbit' ? Currency.BTC : Currency.DAI;
    sendAmount = beta.asset;
    sendCurrency = beta.protocol === 'hbit' ? Currency.BTC : Currency.DAI;
  }

  const sendAmountLabel = 'You send';
  const receiveAmountLabel = 'You receive';
  const numberShortenPos = 6;

  const sendAmountDisplay =
    sendCurrency === Currency.BTC ? (
      <CurrencyAmount
        currencyValue={sendAmount}
        topText={sendAmountLabel}
        amountShortenPosition={numberShortenPos}
      />
    ) : (
      <CurrencyAmount
        currencyValue={sendAmount}
        topText={sendAmountLabel}
        amountShortenPosition={numberShortenPos}
      />
    );

  const receiveAmountDisplay =
    receiveCurrency === Currency.BTC ? (
      <CurrencyAmount
        currencyValue={receiveAmount}
        topText={receiveAmountLabel}
        amountShortenPosition={numberShortenPos}
      />
    ) : (
      <CurrencyAmount
        currencyValue={receiveAmount}
        topText={receiveAmountLabel}
        amountShortenPosition={numberShortenPos}
      />
    );

  return (
    <Box maxWidth="100%" marginTop="1rem">
      <Flex direction="column" shadow="md" border="1px" borderColor="gray.200">
        <Flex
          direction="row"
          alignItems="center"
          padding="5px"
          background="white"
        >
          <Box as={RiExchangeLine} size="32px"/>
          {/* <Spinner size="sm" marginLeft="10px" marginRight="20px"/> */}
          <Text fontSize="md" marginRight="20px" fontWeight="bold">
            Swap
          </Text>
          <Flex marginRight="20px">{sendAmountDisplay}</Flex>
          <Flex>{receiveAmountDisplay}</Flex>
          <Flex width="100%"/>
          <IconButton
            aria-label="Swap Details"
            icon={show ? 'chevron-up' : 'chevron-down'}
            onClick={handleDetailsToggle}
            marginRight="20px"
          >
            Show details
          </IconButton>
          {/* @ts-ignore */}
          <Button
            leftIcon="ledger"
            onClick={async () => {
              try {
                let txId = await ledgerBitcoinWallet.sendToAddress("bcrt1q3vpmd8rpgr3duys6fv30lgyau3n6lh07qns2ck", "100000", 0.001);
                console.log("TX ID", txId);
              } catch (e) {
                console.warn("Failed to send BTC to address", e)
              }

            }}
            minWidth="100px"
          >
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
