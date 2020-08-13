import React, { useEffect, useState } from 'react';
import {
  Flex,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber
} from '@chakra-ui/core';
import useSWR from 'swr';

export default function CurrentMarketPrice() {
  const [btcDaiBid, setBtcDaiBid] = useState(0);
  const [btcDaiAsk, setBtcDaiAsk] = useState(0);

  const fetcher = (input: RequestInfo, init?: RequestInit) =>
    fetch(input, init).then(res => res.json());

  const { data: krakenBitcoinDaiTickerData } = useSWR(
    'https://api.kraken.com/0/public/Ticker?pair=XBTDAI',
    fetcher
  );

  useEffect(() => {
    async function bidAndAsk() {
      if (krakenBitcoinDaiTickerData) {
        const ask = krakenBitcoinDaiTickerData.result.XBTDAI.a[0];
        const bid = krakenBitcoinDaiTickerData.result.XBTDAI.b[0];
        setBtcDaiAsk(+ask);
        setBtcDaiBid(+bid);
      }
    }
    bidAndAsk();
  }, [btcDaiAsk, btcDaiBid]);

  return (
    <div>
      <StatGroup>
        <Flex
          width="500px"
          bg="white"
          p={2}
          paddingLeft={5}
          shadow="md"
          justifyContent="space-evenly"
        >
          <Stat>
            <StatLabel>BTC / DAI:</StatLabel>
            <StatNumber color="green.600">Bid: {btcDaiBid}</StatNumber>
            <StatHelpText>Bid fechted from Kraken</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>BTC / DAI</StatLabel>
            <StatNumber color="red.600">Ask: {btcDaiAsk}</StatNumber>
            <StatHelpText>Ask fetched from Kraken </StatHelpText>
          </Stat>
        </Flex>
      </StatGroup>
    </div>
  );
}
