import React, { useEffect, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/core';
import SwapList from '../components/SwapList';
import OrderCreator from '../components/OrderCreator';
import AvailableBalance from '../components/AvailableBalance';
import MarketOrderList from '../components/MarketOrderList';
import MyOrderList from '../components/MyOrderList';
import { useLedgerEthereumWallet } from '../hooks/useLedgerEthereumWallet';
import { useLedgerBitcoinWallet } from '../hooks/useLedgerBitcoinWallet';
import {
  btcIntoCurVal,
  daiIntoCurVal,
  ethIntoCurVal,
  ZERO_BTC,
  ZERO_DAI,
  ZERO_ETH
} from '../utils/currency';
import { intoBook } from '../utils/book';
import { useCnd } from '../hooks/useCnd';
import useSWR from 'swr/esm/use-swr';
import { intoOrders } from '../utils/order';
import { intoMarket } from '../utils/market';
import BidAndAsk from '../components/BidAndAsk';

export default function DashboardPage() {
  const ethWallet = useLedgerEthereumWallet();
  const btcWallet = useLedgerBitcoinWallet();
  const cnd = useCnd();

  const [ethBalanceAsCurrencyValue, setEthBalanceAsCurrencyValue] = useState(
    ZERO_ETH
  );
  const [daiBalanceAsCurrencyValue, setDaiBalanceAsCurrencyValue] = useState(
    ZERO_DAI
  );
  const [btcBalanceAsCurrencyValue, setBtcBalanceAsCurrencyValue] = useState(
    ZERO_BTC
  );

  useEffect(() => {
    async function loadEthBalance() {
      try {
        const eth = await ethWallet.getEtherBalance();
        const ethCurrencyValue = ethIntoCurVal(eth);
        setEthBalanceAsCurrencyValue(ethCurrencyValue);
      } catch (e) {
        console.error(e);
        console.warn('Falling back to ETH balance 0.');
      }

      try {
        const dai = await ethWallet.getErc20Balance(
          await cnd.daiContractAddress()
        );
        const daiCurrencyValue = daiIntoCurVal(dai);
        setDaiBalanceAsCurrencyValue(daiCurrencyValue);
      } catch (e) {
        console.error(e);
        console.warn('Falling back to DAI balance 0.');
      }
    }

    if (ethWallet) loadEthBalance();
  }, [ethWallet]);

  useEffect(() => {
    async function loadBtcBalance() {
      try {
        const sats = await btcWallet.getBalance();
        const btcCurrencyValue = btcIntoCurVal(sats);
        setBtcBalanceAsCurrencyValue(btcCurrencyValue);
      } catch (e) {
        console.error(e);
        console.warn('Falling back to BTC balance 0.');
      }
    }

    if (btcWallet) loadBtcBalance();
  }, [btcWallet]);

  const { data: orders } = useSWR(
    '/orders',
    key => cnd.fetch(key).then(intoOrders),
    {
      refreshInterval: 1000,
      initialData: []
    }
  );

  const { data: marketResponse } = useSWR(
    '/markets/BTC-DAI',
    key => cnd.fetch(key),
    {
      refreshInterval: 1000
    }
  );

  const market = intoMarket(marketResponse);
  const book = intoBook(
    btcBalanceAsCurrencyValue,
    daiBalanceAsCurrencyValue,
    ethBalanceAsCurrencyValue,
    orders
  );

  const orderTableOffset = '138px';

  return (
    <Flex direction="row" width="100%" padding="1rem">
      <Flex direction="column" width="100%" flexGrow={2}>
        {/* Swaps */}
        <Flex
          direction="column"
          padding="0.5rem"
          width="100%"
          backgroundColor="white"
          shadow="md"
        >
          <Text textShadow="md" fontSize="lg">
            Ongoing Swaps
          </Text>
        </Flex>
        <Flex
          direction="column"
          overflow="scroll"
          shadow="md"
          height="100%"
          backgroundColor="white"
        >
          <SwapList />
        </Flex>
        <Flex direction="row" marginTop="1rem" width="100%">
          {/* Balance */}
          <Flex
            direction="column"
            maxWidth="300px"
            height="100%"
            backgroundColor="white"
            shadow="md"
            padding="1rem"
            paddingRight="0"
            marginRight="1rem"
          >
            <AvailableBalance
              btcAvailable={book.btcAvailableForTrading}
              btcReserved={book.btcInOrders}
              daiAvailable={book.daiAvailableForTrading}
              daiReserved={book.daiInOrders}
              ethAvailable={book.ethAvailableForTrading}
              ethReserved={book.ethInOrders}
            />
          </Flex>
          {/* Order Creator */}
          <Flex
            direction="column"
            minWidth="300px"
            maxWidth="400px"
            marginRight="1rem"
            backgroundColor="white"
            shadow="md"
          >
            <OrderCreator
              highestPriceBuyOrder={market.highestBuyOrder}
              lowestPriceSellOrder={market.lowestSellOrder}
              btcAvailable={book.btcAvailableForTrading}
              daiAvailable={book.daiAvailableForTrading}
              ethAvailable={book.ethAvailableForTrading}
            />
          </Flex>
          {/* My Orders */}
          <Flex
            direction="column"
            width="100%"
            height="100%"
            backgroundColor="white"
            shadow="md"
            padding="1rem"
          >
            <MyOrderList
              key="my-orders"
              orders={orders}
              label="Your Orders"
              tableContentHeightLock="300px"
            />
          </Flex>
        </Flex>
      </Flex>

      {/* Current Market */}
      <Flex direction="column" marginLeft="1rem" flexGrow={1}>
        <Box backgroundColor="white" shadow="md" padding="1rem">
          <MarketOrderList
            key="sell-orders"
            orders={market.sellOrders}
            label="Sell Orders"
            tableContentHeightLock={`calc(50vh - ${orderTableOffset})`}
          />
          <Flex
            direction="row"
            marginTop="1rem"
            marginBottom="1rem"
            align="center"
            borderTopWidth="1px"
            borderBottom="1px"
            borderColor="gray.200"
            justifyItems="space-between"
            paddingTop="0.5rem"
            paddingBottom="0.5rem"
          >
            <BidAndAsk
              highestBuyOrder={market.highestBuyOrder}
              lowestSellOrder={market.lowestSellOrder}
            />
          </Flex>
          <MarketOrderList
            key="buy-orders"
            orders={market.buyOrders}
            label="Buy Orders"
            tableContentHeightLock={`calc(50vh - ${orderTableOffset})`}
          />
        </Box>
      </Flex>
    </Flex>
  );
}
