import React from 'react';
import { StatGroup } from '@chakra-ui/core';
import CurrencyAmount from './CurrencyAmount';
import { amountToUnitString, CurrencyValue } from '../utils/types';

interface AvailableBalanceProperties {
  btcAvailable: CurrencyValue;
  daiAvailable: CurrencyValue;
  ethAvailable: CurrencyValue;
  btcReserved: CurrencyValue;
  daiReserved: CurrencyValue;
  ethReserved: CurrencyValue;
}

export default function AvailableBalance({
  btcAvailable,
  daiAvailable,
  ethAvailable,
  btcReserved,
  daiReserved,
  ethReserved
}: AvailableBalanceProperties) {
  return (
    <StatGroup>
      <CurrencyAmount
        currencyValue={btcAvailable}
        topText="Available BTC"
        subText1={`In orders: ${amountToUnitString(btcReserved)}`}
        amountShortenPosition={8}
        amountFontSize="14pt"
      />
      <CurrencyAmount
        currencyValue={daiAvailable}
        topText="Available DAI"
        subText1={`In orders: ${amountToUnitString(daiReserved)}`}
        amountShortenPosition={8}
        amountFontSize="14pt"
      />
      <CurrencyAmount
        currencyValue={ethAvailable}
        topText="Available ETH"
        subText1={`In orders: ${amountToUnitString(ethReserved)}`}
        amountShortenPosition={8}
        amountFontSize="14pt"
      />
    </StatGroup>
  );
}
