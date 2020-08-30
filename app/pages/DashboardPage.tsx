import React, {useEffect, useState} from 'react';
import {Box, Flex, Heading} from '@chakra-ui/core';
import Store from 'electron-store';
import {BigNumber} from 'ethers';
import SwapList from '../components/SwapList';
import OrderCreator from '../components/OrderCreator';
import AvailableBalance from '../components/AvailableBalance';
import {mockMarketsBtcDai, mockOrders} from '../components/MockData';
import CurrencyAmount, {ColorMode} from '../components/CurrencyAmount';
import MarketOrderList from '../components/MarketOrderList';
import {useEthereumWallet} from '../hooks/useEthereumWallet';
import {useBitcoinWallet} from '../hooks/useBitcoinWallet';
import MyOrderList from '../components/MyOrderList';
import {btcIntoCurVal, daiIntoCurVal, ethIntoCurVal} from "../utils/currency";
import {intoBook} from "../utils/book";
import {intoMarket} from "../utils/market";
import {intoOrders} from "../utils/order";

export default function DashboardPage() {
  // TODO: useSWR to fetch from cnd
  const myOrders = intoOrders(mockOrders());

  const { wallet: ethWallet } = useEthereumWallet();
  const { wallet: btcWallet } = useBitcoinWallet();

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

  const settings = new Store();

  useEffect(() => {
    async function loadEthBalance() {
      const eth = await ethWallet.getBalance();
      const ethBigNumber = BigNumber.from(eth);
      const ethCurrencyValue = ethIntoCurVal(ethBigNumber);
      setEthBalanceAsCurrencyValue(ethCurrencyValue);
    }

    if (ethWallet) loadEthBalance();
  }, [ethWallet]);

  useEffect(() => {
    async function loadDaiBalance() {
      const dai = await ethWallet.getErc20Balance(
        settings.get('ERC20_CONTRACT_ADDRESS')
      );
      const daiCurrencyValue = daiIntoCurVal(dai);
      setDaiBalanceAsCurrencyValue(daiCurrencyValue);
    }

    if (ethWallet) loadDaiBalance();
  }, [ethWallet]);

  useEffect(() => {
    async function loadBtcBalance() {
      const btc = await btcWallet.getBalance();
      const btcBalanceInSats = btc;
      const btcCurrencyValue = btcIntoCurVal(btcBalanceInSats);
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
        {/* Placeholder for more market data */}
        <Flex
          direction="row"
          flexGrow={2}
          alignContent="center"
        />
        {/* Swaps */}
        <Flex direction="column">
          <SwapList />
        </Flex>
        <Flex direction="row" marginTop="1rem" width="100%">
          {/* Balance */}
          <Flex direction="column" maxWidth="200px" height="100%" backgroundColor="white" shadow="md" padding="1rem" paddingRight="0" marginRight="1rem">
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
