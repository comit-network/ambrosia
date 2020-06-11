import React from 'react';
import { Tooltip, Icon, Divider, Box, Heading } from '@chakra-ui/core';
import MarketData from '../components/MarketData';
import Order from '../components/Order';

export default function ExchangePage() {
  return (
    <Box width="100%">
      <Heading fontSize="1.8em" mb={8}>
        Exchange
      </Heading>

      <MarketData />

      <Divider />

      <Heading fontSize="1.4em" mt={8} mb={4}>
        Available Orders
        <Tooltip
          hasArrow
          label="You can pick and choose any order below to proceed with a swap."
          placement="right"
        >
          <Icon ml={2} opacity="0.2" name="question" />
        </Tooltip>
      </Heading>

      <Order status="New" />
    </Box>
  );
}
