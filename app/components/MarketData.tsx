import React from 'react';
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Text,
  Icon
} from '@chakra-ui/core';

export default function MarketData() {
  return (
    <div>
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
            <StatLabel>ETH</StatLabel>
            <StatNumber>$370</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              13.36%
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
      <Text mt={2} fontSize="0.7em" float="left" color="gray.600">
        <Icon name="info" mt="-2px" color="gray.300" mr={1} /> Last 24h market
        data from CoinMarketCap &bull; Last updated 4 minutes ago.
      </Text>
    </div>
  );
}
