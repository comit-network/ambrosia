import React from 'react';
import { Divider, Flex, Stack, Text } from '@chakra-ui/core';
import SwapList from '../components/SwapList';
import OrderCreator from "../components/OrderCreator";
import AvailableBalance from "../components/AvailableBalance";

const mockOrders = (mockLabel: string, amount: number) => {
  const orders = [];
  for (let i = 0; i < amount; i += 1) {
    orders.push(<Text key={i}>{mockLabel}</Text>);
  }

  return <Stack>{orders}</Stack>;
};

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
        <Flex background="white" minWidth="200px" maxWidth="200px" padding="1rem">
            <AvailableBalance />
        </Flex>

        <Divider orientation="vertical" />

        <Flex background="white" minWidth="400px">
          <OrderCreator />
        </Flex>

        <Divider orientation="vertical" />

        <Flex background="white" width="100%" overflow="scroll">
          {mockOrders(
            'An Order that is not matched yet, can be cancelled with X in',
            20
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
