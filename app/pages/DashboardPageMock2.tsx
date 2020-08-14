import React from 'react';
import { Box, Divider, Flex, Stack, Text } from '@chakra-ui/core';

export default function DashboardPageMock2() {
  return (
    <Box width="100%" height="100%">
      <Flex direction="column" height="100%">
        <Flex flexDirection="row" width="100%" minHeight="300px">
          <Flex background="gray" minWidth="200px" maxWidth="200px">
            <Text> Wallet with available balances </Text>
          </Flex>

          <Divider orientation="vertical" />

          <Flex background="white" minWidth="400px">
            <Text>
              {' '}
              Mock-2: Trading screen, depict Buy / Sell, Market / Limit
            </Text>
          </Flex>

          <Divider orientation="vertical" />

          <Flex background="white" minWidth="300px" width="100%">
            <Text>
              {' '}
              Current COMIT market, showing orders and current ask and bid
            </Text>
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
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
              <Text> My current Orders AND Execution </Text>
            </Stack>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
