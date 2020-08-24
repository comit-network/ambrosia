import React from 'react';
import {StatGroup} from '@chakra-ui/core';
import CurrencyAmount, {amountToUnitString, Currency, CurrencyUnit} from './CurrencyAmount';

interface AvailableBalanceProperties {
  btcAvailable: number;
  daiAvailable: number;
  ethAvailable: number;
  btcReserved: number;
  daiReserved: number;
  ethReserved: number;
}

export default function AvailableBalance({btcAvailable, daiAvailable, ethAvailable, btcReserved, daiReserved, ethReserved}: AvailableBalanceProperties) {

  return (
    <StatGroup>
      <CurrencyAmount
        amount={btcAvailable}
        currency={Currency.BTC}
        unit={CurrencyUnit.BTC}
        topText="Available BTC"
        subText1={`In orders: ${
          amountToUnitString(btcReserved, CurrencyUnit.BTC)
        }`}
        amountShortenPosition={8}
        amountFontSize="14pt"
      />
      <CurrencyAmount
        amount={daiAvailable}
        currency={Currency.DAI}
        unit={CurrencyUnit.DAI}
        topText="Available DAI"
        subText1={`In orders: ${
          amountToUnitString(daiReserved, CurrencyUnit.DAI)}`}
        amountShortenPosition={8}
        amountFontSize="14pt"
      />
      <CurrencyAmount
        amount={ethAvailable}
        currency={Currency.ETH}
        unit={CurrencyUnit.ETHER}
        topText="Available ETH"
        subText1={`In orders: ${
          amountToUnitString(ethReserved, CurrencyUnit.ETHER)}`}
        amountShortenPosition={8}
        amountFontSize="14pt"
      />
    </StatGroup>
  );
}
