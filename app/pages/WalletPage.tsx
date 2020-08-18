import React from 'react';
import { Divider, Flex, Heading } from '@chakra-ui/core';
import TradingBalanceHorizontal from "../components/TradingBalanceHorizontal";

export default function WalletPage() {
  return (
    <Flex direction="column" width="100%">
      <Flex
        background="white"
        direction="row"
        width="100%"
        minHeight="100px"
        maxHeight="400px"
      >
        <Heading fontSize="1.0em" mb={8}>
          Currency details; total, locked in orders. Also show price in USD /
          (...)
        </Heading>

          <TradingBalanceHorizontal />

      </Flex>

      <Divider />

      <Flex
        background="white"
        direction="row"
        width="100%"
        maxHeight="100%"
        height="100%"
      >
        <Heading fontSize="1.0em" mb={8}>
          List of Transactions, the transactions are related to SWAPS - you see
          when you had (-) because of funding and (+) because of redeeming.
        </Heading>
      </Flex>
    </Flex>
  );
}
