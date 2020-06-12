import React from 'react';
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup
} from '@chakra-ui/core';

export default function Balances() {
  return (
    <StatGroup>
      <Flex
        width="100%"
        justifyContent="space-between"
        bg="white"
        p={5}
        shadow="md"
      >
        <Stat>
          <StatLabel>BTC</StatLabel>
          <StatNumber>1.546</StatNumber>
          <StatHelpText>USD $15,670</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>ETH</StatLabel>
          <StatNumber>0.546</StatNumber>
          <StatHelpText>USD $370</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>DAI</StatLabel>
          <StatNumber>547</StatNumber>
          <StatHelpText>USD $547.00</StatHelpText>
        </Stat>
      </Flex>
    </StatGroup>
  );
}
