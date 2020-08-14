import React from 'react';
import { Box, Divider, Flex, Stack, Text } from '@chakra-ui/core';
import TradingBalanceHorizontal from '../components/TradingBalanceHorizontal';
import CurrentMarketPrice from '../components/CurrentMarketPrice';

export default function DashboardPage() {
  return (
    <Box width="100%" height="100%">
      <Flex direction="column" height="100%">
        <Flex flexDirection="row" width="100%" minHeight="300px">
          <Flex minWidth="600px" maxWidth="600px">
            <TradingBalanceHorizontal />
          </Flex>

          <Divider orientation="vertical" />

          <Flex width="100%">
            <CurrentMarketPrice />
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
            </Stack>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
