import React from 'react';
import { Box, Divider, Flex, Stack, Text } from '@chakra-ui/core';

const mockOrders = (mockLabel: string, amount: number) => {
  const orders = [];
  for (let i = 0; i < amount; i += 1) {
    orders.push(<Text key={i}>{mockLabel}</Text>);
  }

  return <Stack>{orders}</Stack>;
};

export default function DashboardPageMock2() {
  return (
    <Box width="100%" height="100%">
      <Flex flexDirection="row" width="100%" maxHeight="calc(100% - 300px)">
        <Flex background="gray" minWidth="200px" maxWidth="200px">
          <Text> Status of ledger and blockchain nodes</Text>
        </Flex>

        <Divider orientation="vertical" />

        <Flex
          background="white"
          width="100%"
          maxHeight="100%"
          overflow="scroll"
        >
          {mockOrders(
            'An Order that is not matched yet, can be cancelled with X in',
            20
          )}
        </Flex>
      </Flex>

      <Divider />

      <Flex
        flexDirection="row"
        width="100%"
        minHeight="300px"
        maxHeight="300px"
      >
        <Flex background="gray" minWidth="200px" maxWidth="200px">
          <Text> Wallet with available balances </Text>
        </Flex>

        <Divider orientation="vertical" />

        <Flex background="white" minWidth="400px">
          <Text> Trading screen, depict Buy / Sell, Market / Limit</Text>
        </Flex>

        <Divider orientation="vertical" />

        <Flex
          background="white"
          minWidth="300px"
          width="100%"
          overflow="scroll"
        >
          {mockOrders('Current commit market', 10)}
        </Flex>
      </Flex>
    </Box>
  );
}
