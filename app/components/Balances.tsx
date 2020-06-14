import React from 'react';
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Text,
  Icon
} from '@chakra-ui/core';

export default function Balances() {
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
            <StatNumber>1.546</StatNumber>
            <StatHelpText>USD $15,670.23</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>ETH</StatLabel>
            <StatNumber>0.546</StatNumber>
            <StatHelpText>USD $370.32</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>DAI</StatLabel>
            <StatNumber>547</StatNumber>
            <StatHelpText>USD $547.00</StatHelpText>
          </Stat>
        </Flex>
      </StatGroup>
      <Text mt={2} fontSize="0.7em" float="left" color="gray.600">
        <Icon name="info" mt="-2px" color="gray.300" mr={1} /> Live market data
        from CoinMarketCap &bull; Last updated 4 minutes ago.
      </Text>
    </div>
  );
}
