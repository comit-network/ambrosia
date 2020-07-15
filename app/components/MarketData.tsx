import React, { useState, useEffect } from 'react';
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Text,
  Icon
} from '@chakra-ui/core';
import useSWR from 'swr';

export default function MarketData() {
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: ETHPriceData } = useSWR(
    'https://api.coincap.io/v2/rates/ethereum',
    fetcher
  );

  const [ETHPrice, setETHPrice] = useState(null);

  useEffect(() => {
    async function loadETHPrice() {
      if (ETHPriceData) {
        const rate = ETHPriceData.data.rateUsd;
        const price = parseFloat(rate).toFixed(2);
        setETHPrice(price);
      }
    }
    loadETHPrice();
  }, []);

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
            <StatLabel>BTC Price</StatLabel>
            <StatNumber>$5,670</StatNumber>
          </Stat>

          <Stat>
            <StatLabel>ETH Price</StatLabel>
            <StatNumber>${ETHPrice}</StatNumber>
          </Stat>

          <Stat>
            <StatLabel>DAI Price</StatLabel>
            <StatNumber>$1.00</StatNumber>
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
