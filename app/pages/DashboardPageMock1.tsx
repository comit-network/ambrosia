import React from 'react';
import { Box, Divider, Flex, Stack, Text } from '@chakra-ui/core';

const mockOrders = (mockLabel: string, amount: number) => {
  const orders = [];
  for (let i = 0; i < amount; i += 1) {
    orders.push(<Text key={i}>{mockLabel}</Text>);
  }

  return <Stack>{orders}</Stack>;
};

export default function DashboardPageMock1() {
  return (
    <Box width="100%" height="100%">
      <Flex direction="column" height="100%">
        <Flex flexDirection="row" width="100%" minHeight="300px">
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

        <Divider />

        <Flex flexDirection="row" width="100%" height="100%">
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
            <Stack>
              {mockOrders(
                'An Order that is already in execution, cannot be cancelled, shows Swap exec details',
                3
              )}
              {mockOrders(
                'An Order that is not matched yet, can be cancelled with X in',
                20
              )}
            </Stack>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
