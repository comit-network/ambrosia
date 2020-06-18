import React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip, Icon, Divider, Box, Heading, Text } from '@chakra-ui/core';
import MarketData from '../components/MarketData';
import Order from '../components/Order';

export default function ExchangePage() {
  return (
    <Box width="100%">
      <Heading fontSize="1.8em" mb={8}>
        Exchange
      </Heading>

      <Heading fontSize="1.4em" mt={8} mb={4}>
        Market Data{' '}
        <Text display="inline" opacity={0.3}>
          (24h)
        </Text>
      </Heading>
      <MarketData />

      <Divider p={6} />

      <Heading fontSize="1.4em" mt={8} mb={4}>
        Available Orders
        <Tooltip
          hasArrow
          aria-label="You can pick and choose any order below to proceed with a swap."
          label="You can pick and choose any order below to proceed with a swap."
          placement="right"
        >
          <Icon ml={2} opacity={0.2} name="question" />
        </Tooltip>
      </Heading>

      <Link to="/orders/1">
        <Order status="New" />
      </Link>
    </Box>
  );
}
