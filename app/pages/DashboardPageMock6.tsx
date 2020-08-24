import React from 'react';
import { Box, Flex, Stack, TagLabel, Text } from '@chakra-ui/core';
import SwapList from '../components/SwapList';
import OrderCreator from '../components/OrderCreator';
import AvailableBalance from '../components/AvailableBalance';
import {mockMarketsBtcDai, mockOrders} from '../components/MockData';
import CurrencyAmount, {
    ColorMode,
    Currency,
    CurrencyUnit
} from '../components/CurrencyAmount';
import MarketOrderList, {MarketOrder} from "../components/MarketOrderList";
import MyOrderList, {Order} from "../components/MyOrderList";

const boxHeader = (header: string) => {
  return (
    <Box width="100%" backgroundColor="gray.600">
      <TagLabel
        paddingLeft="0.5rem"
        paddingTop="0.5"
        fontSize="md"
        color="white"
        fontWeight="bold"
      >
        {header}
      </TagLabel>
    </Box>
  );
};

// Learnings:
// 1. Swaps have individual state, thus the Swap component has to handle it's own state.
// 2. Orders don't change (they don't have state), the only action one can do on them is "cancel" - orders are handled globally
// 3. Balances don't have state, and we need them for calculation with orders, so I suppose we have to handle the on the page as well.

export default function DashboardPageMock6() {

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
    order => order.properties as MarketOrder
  );

  // sorted ascending by price
  const buyOrders = orders
    .filter(order => order.position === 'buy')
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
    .filter(order => order.position === 'sell')
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

    const theirOrders = orders.filter(order => !order.ours);
    const theirBuyOrders = theirOrders.filter(order => order.position === 'buy');
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

    const orderTableOffset = "50px";

  return (
    <Flex direction="column" width="100%" padding="1rem">
      {/* Market Data */}
      <Flex direction="row" width="100%" flexBasis="50vh"  minHeight={0}>
        {/* Best Bid / Ask */}
        <Box
          minWidth="200px"
          backgroundColor="white"
          shadow="md"
          marginRight="1rem"
        >
          {boxHeader('Best Buy / Sell Price')}
          <Stack padding="1rem">
              <CurrencyAmount amount={lowestSellOrder.price.value} currency={Currency.DAI} unit={CurrencyUnit.ATTO} topText={"Bid"} colourMode={ColorMode.RED} />
              <CurrencyAmount amount={highestBuyOrder.price.value} currency={Currency.DAI} unit={CurrencyUnit.ATTO} topText={"Ask"} colourMode={ColorMode.GREEN}/>
          </Stack>
        </Box>

        {/* Market orders */}
        <Flex direction="row" width="100%" height="100px">
            <Box marginRight="1rem" width="100%">
                <MarketOrderList key="sell-orders" orders={sellOrders} colorMode={ColorMode.RED} tableContentHeightLock={"calc(30vh - " + orderTableOffset + ")"} />
            </Box>
            <Box  width="100%">
                <MarketOrderList key="buy-orders" orders={buyOrders} colorMode={ColorMode.GREEN} tableContentHeightLock={"calc(30vh - " + orderTableOffset + ")"} />
            </Box>
        </Flex>
      </Flex>

      {/* Order Execution */}
      <Flex flexDirection="row" width="100%" marginTop="1rem">
        {/* Device Status */}
        <Flex
          direction="column"
          background="white"
          minWidth="200px"
          maxWidth="200px"
          shadow="md"
          marginRight="1rem"
        >
          {boxHeader('Status')}
        </Flex>

        {/* Ongoing Swaps */}
        <Flex
          direction="column"
          background="white"
          width="100%"
          overflow="scroll"
          shadow="md"
        >
          {boxHeader('Swaps')}
          <Box paddingTop="0.5rem" paddingBottom="0.5rem">
            <SwapList />
          </Box>
        </Flex>
      </Flex>

      {/* Order Creation */}
      <Flex
        flexDirection="row"
        width="100%"
        marginTop="1rem"
      >
        {/* Balance Overview */}
        <Flex
          direction="column"
          background="white"
          minWidth="200px"
          maxWidth="200px"
          shadow="md"
          marginRight="1rem"
        >
          {boxHeader('Trading Balance')}
          <Box padding="1rem">
            <AvailableBalance />
          </Box>
        </Flex>

        {/* Create Orders */}
        <Flex
          direction="column"
          background="white"
          minWidth="400px"
          shadow="md"
          marginRight="1rem"
        >
          {boxHeader('Create Order')}
          <Box padding="1rem">
            <OrderCreator />
          </Box>
        </Flex>

        {/* My Order list */}
        <Flex
          direction="column"
          background="white"
          width="100%"
        >
          {boxHeader('Your Orders')}
              <Flex direction="column" width="100%">
                  <MyOrderList key="my-orders" orders={myOrders} tableContentHeightLock="300px" />
              </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
