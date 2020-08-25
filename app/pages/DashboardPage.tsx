import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading } from '@chakra-ui/core';
import Store from 'electron-store';
import { BigNumber } from 'ethers';
import SwapList from '../components/SwapList';
import OrderCreator from '../components/OrderCreator';
import AvailableBalance from '../components/AvailableBalance';
import { mockMarketsBtcDai, mockOrders } from '../components/MockData';
import CurrencyAmount, { ColorMode } from '../components/CurrencyAmount';
import MarketOrderList from '../components/MarketOrderList';
import { useEthereumWallet } from '../hooks/useEthereumWallet';
import { useBitcoinWallet } from '../hooks/useBitcoinWallet';
import MyOrderList from '../components/MyOrderList';
import {
  CurrencyValue,
  intoMarket,
  intoOrders,
  intoBook
} from '../utils/types';

export default function DashboardPage() {
  // TODO: useSWR to fetch from cnd
  const myOrders = intoOrders(mockOrders());

  const { wallet: ethWallet, loaded: ethWalletLoaded } = useEthereumWallet();
  const { wallet: btcWallet, loaded: btcWalletLoaded } = useBitcoinWallet();

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
      const ethCurrencyValue = {
        currency: 'ETH',
        value: ethBigNumber.toString(),
        decimals: 18
      } as CurrencyValue;

      setEthBalanceAsCurrencyValue(ethCurrencyValue);
    }

    if (ethWallet) loadEthBalance();
  }, [ethWallet]);

  useEffect(() => {
    async function loadDaiBalance() {
      const dai = await ethWallet.getErc20Balance(
        settings.get('ERC20_CONTRACT_ADDRESS')
      );
      const daiCurrencyValue = {
        currency: 'DAI',
        value: dai.toString(),
        decimals: 18
      } as CurrencyValue;
      setDaiBalanceAsCurrencyValue(daiCurrencyValue);
    }

    if (ethWallet) loadDaiBalance();
  }, [ethWallet]);

  useEffect(() => {
    async function loadBtcBalance() {
      const btc = await btcWallet.getBalance();
      const btcBalanceInSats = btc * 100000000;
      const btcCurrencyValue = {
        currency: 'BTC',
        value: btcBalanceInSats.toString(),
        decimals: 8
      } as CurrencyValue;
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

  const orderTableOffset = '136px';

  return (
    <Flex direction="row" width="100%" padding="1rem">
      <Flex direction="column" width="100%" flexGrow={2}>
        {/* Graph */}
        <Flex
          direction="row"
          flexGrow={2}
          alignContent="center"
          backgroundColor="gray.400"
        >
          <Heading>Imagine market data chart here</Heading>
        </Flex>
        {/* Swaps */}
        <Flex direction="row" marginTop="1rem">
          <SwapList />
        </Flex>
        <Flex direction="row" marginTop="1rem" width="100%" >
          {/* Balance */}
          <Flex direction="column" maxWidth="200px" marginTop="40px">
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
          <Flex direction="column" minWidth="300px" maxWidth="400px" marginRight="1rem">
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
        <MarketOrderList
          key="sell-orders"
          orders={market.sellOrders}
          label="Sell Orders"
          tableContentHeightLock={`calc(50vh - ${orderTableOffset})`}
        />
        <Flex
          direction="column"
          marginTop="1rem"
          marginBottom="1rem"
          align="center"
        >
          <CurrencyAmount
            currencyValue={market.lowestSellOrder.price}
            topText="Bid"
            colourMode={ColorMode.RED}
          />
          <CurrencyAmount
            currencyValue={market.highestBuyOrder.price}
            topText="Ask"
            colourMode={ColorMode.GREEN}
          />
        </Flex>
        <MarketOrderList
          key="buy-orders"
          orders={market.buyOrders}
          label="Buy Orders"
          tableContentHeightLock={`calc(50vh - ${orderTableOffset})`}
        />
      </Flex>
    </Flex>
  );
}
