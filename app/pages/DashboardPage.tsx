import React from 'react';
import { Divider, Flex, Stack, Text } from '@chakra-ui/core';
import SwapList from '../components/SwapList';
import OrderCreator from '../components/OrderCreator';
import AvailableBalance from '../components/AvailableBalance';

const mockOrders = (mockLabel: string, amount: number) => {
  const orders = [];
  for (let i = 0; i < amount; i += 1) {
    orders.push(<Text key={i}>{mockLabel}</Text>);
  }

  return <Stack>{orders}</Stack>;
};

// TODO: Build fetching orders (global for dashboard page)
//      1. periodically fetch
//      2. Calculate what is needed (reserved, split out my own orders, best bid and ask ...)
//      3. Pass the information needed to components of the page

// Learnings:
// 1. Swaps have individual state, thus the Swap component has to handle it's own state.
// 2. Orders don't change (they don't have state), the only action one can do on them is "cancel" - orders are handled globally
// 3. Balances don't have state, and we need them for calculation with orders, so I suppose we have to handle the on the page as well.

export default function DashboardPage() {
  return (
    <Flex direction="column" width="100%" minHeight="100%">
      <Flex background="white" minWidth="300px" width="100%" overflow="scroll">
        {mockOrders('Current commit market', 20)}
      </Flex>

      <Divider />

      <Flex flexDirection="row" width="100%" maxHeight="300px">
        <Flex background="gray" minWidth="200px" maxWidth="200px">
          <Text> Status of ledger and blockchain nodes</Text>
        </Flex>

        <Divider orientation="vertical" />

        <Flex background="white" width="100%" overflow="scroll">
          <SwapList />
        </Flex>
      </Flex>

      <Divider />

      <Flex
        flexDirection="row"
        width="100%"
        minHeight="300px"
        maxHeight="300px"
      >
        <Flex
          background="white"
          minWidth="200px"
          maxWidth="200px"
          padding="1rem"
        >
          <AvailableBalance />
        </Flex>

        <Divider orientation="vertical" />

        <Flex background="white" minWidth="400px">
          <OrderCreator />
        </Flex>

        <Divider orientation="vertical" />

        <Flex background="white" width="100%" overflow="scroll">
          <Stack>
            <Text>Bla</Text>
          </Stack>
        </Flex>
      </Flex>
    </Flex>
  );
}
