import React, { useEffect, useReducer, useState } from 'react';
import { Box, Button, Collapse, Flex, IconButton, Text } from '@chakra-ui/core';
import { RiExchangeLine } from 'react-icons/ri';
import { useEthereumWallet } from '../hooks/useEthereumWallet';
import { useBitcoinWallet } from '../hooks/useBitcoinWallet';
import { useCnd } from '../hooks/useCnd';
import CurrencyAmount from './CurrencyAmount';
import { mockSwap } from './MockData';
import { Currency } from '../utils/types';
import { useLedgerClient } from '../hooks/useLedgerClient';
import { Psbt } from 'bitcoinjs-lib';

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
  const ledgerClient = useLedgerClient();

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
                let response = await ledgerClient.signBitcoinTransaction(Psbt.fromBase64('cHNidP8BAHECAAAAAaRQ5OtfQp3pAgxhTogbAhknSJESkYOe4NGhEtYZjtrEAQAAAAD+////AuyxpDUAAAAAFgAUJDzHJSQHi/gOqZXtPppUAOqzwzkA4fUFAAAAABYAFIsDtpxhQOLeEhpLIv+gneRnr93+AAAAAAABAR8Aypo7AAAAABYAFO4BIbzv1Rm3jA75Ng3qmk1ZEUIfIgYDbXrhM7lpiaTJhxwJSplsX1r33gCcoD9xL4wEteLypE8YRwNsJ1QAAIABAACAAAAAgAAAAAAAAAAAACICA41qbwkk52gSv+O5uhwZF6VACefY18tUzuMuWI8rSfwoGEcDbCdUAACAAQAAgAAAAIABAAAAAAAAAAAA'), [{
                  tx: '0200000000010118196daed60782013221096d18d28106eff5a2197b14ec4354cc90aa130882db0000000000feffffff02fc236859000000001600143a4ac63f49f2bc287c8f7ac14a52de4f7a7ba14d00ca9a3b00000000160014ee0121bcefd519b78c0ef9360dea9a4d5911421f0247304402202e174366ae829a53d251ed53f5f907bf7183917d048820952c54d580ab765c20022017a01c564e08937ae644fb7a03d9525fda7c978418cc9931fb7126731eae1226012103fc9a820681479d7db6b161045263f34f0aedc73a7801f8d0380ac1991162d4ae2f010000',
                  index: 0
                }]);
                console.log("Signed transaction", response);
              } catch (e) {
                console.warn("Signing failed", e)
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
