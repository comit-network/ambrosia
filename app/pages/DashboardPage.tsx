import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text } from '@chakra-ui/core';
import SwapList from '../components/SwapList';
import OrderCreator from '../components/OrderCreator';
import AvailableBalance from '../components/AvailableBalance';
import { mockMarketsBtcDai, mockOrders } from '../components/MockData';
import CurrencyAmount, { ColorMode } from '../components/CurrencyAmount';
import MarketOrderList from '../components/MarketOrderList';
import MyOrderList from '../components/MyOrderList';
import { useLedgerEthereumWallet } from '../hooks/useLedgerEthereumWallet';
import { useLedgerBitcoinWallet } from '../hooks/useLedgerBitcoinWallet';
import { btcIntoCurVal, daiIntoCurVal, ethIntoCurVal } from '../utils/currency';
import { intoMarket } from '../utils/market';
import { intoBook } from '../utils/book';
import { intoOrders } from '../utils/order';
import { Config } from '../config';

interface Props {
  settings: Config
}

export default function DashboardPage({settings}: Props) {
  // TODO: useSWR to fetch from cnd
  const myOrders = intoOrders(mockOrders());


  const ethWallet = useLedgerEthereumWallet();
  const btcWallet = useLedgerBitcoinWallet();

  const [ethBalanceAsCurrencyValue, setEthBalanceAsCurrencyValue] = useState(
    null
  );
  const [daiBalanceAsCurrencyValue, setDaiBalanceAsCurrencyValue] = useState(
    null
  );
  const [btcBalanceAsCurrencyValue, setBtcBalanceAsCurrencyValue] = useState(
    null
  );
  const [book, setBook] = useState(null);

  useEffect(() => {
    async function loadEthBalance() {
      const eth = await ethWallet.getEtherBalance();
      const ethCurrencyValue = ethIntoCurVal(eth);
      setEthBalanceAsCurrencyValue(ethCurrencyValue);
    }

    if (ethWallet) loadEthBalance();
  }, [ethWallet]);

  useEffect(() => {
    async function loadDaiBalance() {
      const dai = await ethWallet.getErc20Balance(
        settings.ERC20_CONTRACT_ADDRESS
      );
      const daiCurrencyValue = daiIntoCurVal(dai);
      setDaiBalanceAsCurrencyValue(daiCurrencyValue);
    }

    if (ethWallet) loadDaiBalance();
  }, [ethWallet]);

  useEffect(() => {
    async function loadBtcBalance() {
      const sats = await btcWallet.getBalance();
      const btcCurrencyValue = btcIntoCurVal(sats);
      setBtcBalanceAsCurrencyValue(btcCurrencyValue);
    }

    if (btcWallet) loadBtcBalance();
  }, [btcWallet]);

  useEffect(() => {
    setBook(
      intoBook(
        btcBalanceAsCurrencyValue,
        daiBalanceAsCurrencyValue,
        ethBalanceAsCurrencyValue,
        myOrders
      )
    );
  }, [
    ethBalanceAsCurrencyValue,
    btcBalanceAsCurrencyValue,
    daiBalanceAsCurrencyValue
  ]);

  // TODO: useSWR to fetch from cnd
  const market = intoMarket(mockMarketsBtcDai());

  if (!book) {
    // TODO: Proper init handling
    return (
      <Box>
        <Heading>Loading...</Heading>
      </Box>
    );
  }

  const orderTableOffset = '138px';

  return (
    <Flex direction="row" width="100%" padding="1rem">
      <Flex direction="column" width="100%" flexGrow={2}>
        {/* Swaps */}
        <Flex direction="column" padding="0.5rem" width="100%" backgroundColor="white" shadow="md">
          <Text textShadow="md" fontSize="lg">
            Ongoing Swaps
          </Text>
        </Flex>
        <Flex direction="column" overflow="scroll" shadow="md" height="100%" backgroundColor="white">
          <SwapList />
        </Flex>
        <Flex direction="row" marginTop="1rem" width="100%">
          {/* Balance */}
          <Flex direction="column" maxWidth="300px" height="100%" backgroundColor="white" shadow="md" padding="1rem" paddingRight="0" marginRight="1rem">
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
          <Flex direction="column" width="100%">
            <MyOrderList
              key="my-orders"
              orders={myOrders}
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
            <CurrencyAmount
              currencyValue={market.lowestSellOrder.price}
              topText="Bid"
              colourMode={ColorMode.RED}
              noImage
            />
            <CurrencyAmount
              currencyValue={market.highestBuyOrder.price}
              topText="Ask"
              colourMode={ColorMode.GREEN}
              noImage
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
