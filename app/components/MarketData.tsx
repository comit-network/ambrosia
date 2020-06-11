import React from 'react';
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup
} from '@chakra-ui/core';

export default function MarketData() {
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
          <StatNumber>$5,670</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            23.36%
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>DAI</StatLabel>
          <StatNumber>$1.00</StatNumber>
          <StatHelpText>
            <StatArrow type="decrease" />
            9.05%
          </StatHelpText>
        </Stat>
      </Flex>
    </StatGroup>
  );
}
