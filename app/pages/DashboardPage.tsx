import React, {useEffect, useState} from 'react';
import {Box, Flex, Heading} from '@chakra-ui/core';
import SwapList from '../components/SwapList';
import OrderCreator from '../components/OrderCreator';
import AvailableBalance from '../components/AvailableBalance';
import {mockMarketsBtcDai, mockOrders} from '../components/MockData';
import CurrencyAmount, {amountToUnitString, ColorMode, Currency, CurrencyUnit} from '../components/CurrencyAmount';
import MarketOrderList, {MarketOrder} from "../components/MarketOrderList";
import {useEthereumWallet} from "../hooks/useEthereumWallet";
import {useBitcoinWallet} from "../hooks/useBitcoinWallet";
import Store from "electron-store";
import {BigNumber, ethers} from "ethers";
import MyOrderList, {Order} from "../components/MyOrderList";

export default function DashboardPage() {
    const { wallet: ethWallet, loaded: ethWalletLoaded } = useEthereumWallet();
    const { wallet: btcWallet, loaded: btcWalletLoaded } = useBitcoinWallet();
    const [ethBalance, setEthBalance] = useState(null);
    const [daiBalance, setDaiBalance] = useState(null);
    const [btcBalance, setBtcBalance] = useState(null);

    // TODO: Properly handle wallet balances as CurrencyValue and not just strings / numbers...
    const [ethBalanceInWei, setEthBalanceInWei] = useState(null);
    const [daiBalanceInWei, setDaiBalanceInWei] = useState(null);
    const [btcBalanceInSat, setBtcBalanceInSat] = useState(null);

    // TODO: [CndApi] ? - or should we calc that ourselves
    // FixMe: [MockData]
    const ethReserved = 111.11111;
    const daiReserved = 50;
    const btcReserved = 0.5;

    const btcAvailable = btcBalance - btcReserved;
    const daiAvailable = daiBalance - daiReserved;
    const ethAvailable = ethBalance - ethReserved;

    const settings = new Store();

    useEffect(() => {
        async function loadEthBalance() {
            const eth = await ethWallet.getBalance();
            setEthBalance(ethers.utils.formatEther(BigNumber.from(eth)));
            setEthBalanceInWei(BigNumber.from(eth));
        }

        if (ethWallet) loadEthBalance();
    }, [ethWalletLoaded]);

    useEffect(() => {
        async function loadDaiBalance() {
            const dai = await ethWallet.getErc20Balance(
                settings.get('ERC20_CONTRACT_ADDRESS')
            );
            setDaiBalance(dai.toString());
        }

        if (ethWallet) loadDaiBalance();
    }, [ethWalletLoaded]);

    useEffect(() => {
        async function loadBtcBalance() {
            const btc = await btcWallet.getBalance();
            setBtcBalance(btc);
        }

        if (btcWallet) loadBtcBalance();
    }, [btcWalletLoaded]);

    // TODO: useSWR to fetch from cnd
    const myOrders = mockOrders().data.entities.map(
        (order) => order.properties as Order
    ).sort((order1, order2) => {
        const price1 = order1.price.value;
        const price2 = order2.price.value;
        if (price1 < price2) {
            return -1;
        }
        if (price1 > price2) {
            return 1;
        }
        return 0;
    });

  // TODO: useSWR to fetch from cnd
  const orders = mockMarketsBtcDai().data.entities.map(
    (order) => order.properties as MarketOrder
  );

  // sorted ascending by price
  const buyOrders = orders
    .filter((order) => order.position === 'buy')
    .sort((order1, order2) => {
      const price1 = order1.price.value;
      const price2 = order2.price.value;
      if (price1 < price2) {
        return -1;
      }
      if (price1 > price2) {
        return 1;
      }
      return 0;
    });
  // sorted descending by price
  const sellOrders = orders
    .filter((order) => order.position === 'sell')
    .sort((order1, order2) => {
      const price1 = order1.price.value;
      const price2 = order2.price.value;
      if (price1 < price2) {
        return 1;
      }
      if (price1 > price2) {
        return -1;
      }
      return 0;
    });

  const theirOrders = orders.filter((order) => !order.ours);
  const theirBuyOrders = theirOrders.filter((order) => order.position === 'buy');
  const theirSellOrders = theirOrders.filter(
    order => order.position === 'sell'
  );
  // their highest buying price is my best selling price
  const highestBuyOrder = theirBuyOrders.reduce((acc, loc) =>
    acc.quantity.value > loc.quantity.value ? acc : loc
  );
  // their lowest selling price is my best buying price
  const lowestSellOrder = theirSellOrders.reduce((acc, loc) =>
    acc.quantity.value < loc.quantity.value ? acc : loc
  );

  const orderTableOffset = "140px";

  return (
    <Flex direction="row" width="100%" padding="1rem">
        <Flex direction="column" width="100%">
            {/* Graph */}
            <Flex direction="row" flexGrow={2} alignContent="center" background="white">
                <Heading>Imagine a chart here</Heading>
            </Flex>
            {/* Swaps */}
            <Flex direction="row" marginTop="1rem">
                <SwapList />
            </Flex>
            <Flex direction="row" marginTop="1rem" width="100%">
                {/* Balance */}
                <Flex direction="column" width="200px">
                    <AvailableBalance
                        btcAvailable={btcAvailable}
                        btcReserved={btcReserved}
                        daiAvailable={daiAvailable}
                        daiReserved={daiReserved}
                        ethAvailable={ethAvailable}
                        ethReserved={ethReserved}
                    />
                </Flex>
                {/* Order Creator*/}
                <Flex direction="column" minWidth="300px">
                    <OrderCreator />
                </Flex>
                {/* My Orders */}
                <Flex direction="column" width="100%">
                    <MyOrderList key="my-orders" orders={myOrders} label={"Your Orders"} tableContentHeightLock="300px" />
                </Flex>
            </Flex>
        </Flex>

        {/* Current Market */}
        <Flex direction="column" marginLeft="1rem">
            <MarketOrderList key="sell-orders" orders={sellOrders} label={"Sell Orders"} colorMode={ColorMode.RED} tableContentHeightLock={"calc(50vh - " + orderTableOffset + ")"} />
            <Flex direction="column" marginTop="1rem" marginBottom="1rem" align="center">
                <CurrencyAmount amount={lowestSellOrder.price.value} currency={Currency.DAI} unit={CurrencyUnit.ATTO} topText={"Bid"} colourMode={ColorMode.RED} />
                <CurrencyAmount amount={highestBuyOrder.price.value} currency={Currency.DAI} unit={CurrencyUnit.ATTO} topText={"Ask"} colourMode={ColorMode.GREEN}/>
            </Flex>
            <MarketOrderList key="buy-orders" orders={buyOrders} label={"Buy Orders"} colorMode={ColorMode.GREEN} tableContentHeightLock={"calc(50vh - " + orderTableOffset + ")"} />
        </Flex>

    </Flex>
  );
}
