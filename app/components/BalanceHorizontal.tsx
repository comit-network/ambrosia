import React from 'react';
import { Flex, StatGroup } from '@chakra-ui/core';
import CurrencyAmount from './CurrencyAmount';
import { amountToUnitString } from '../utils/currency';
import useBook from '../hooks/useBook';

export default function BalanceHorizontal() {
  const book = useBook();

  return (
    <div>
      <StatGroup>
        <Flex
          bg="white"
          p={2}
          shadow="md"
          justifyContent="space-evenly"
          minWidth="600px"
        >
          <CurrencyAmount
            currencyValue={book.btcTotal}
            topText="BTC"
            subText1={`Available: ${amountToUnitString(
              book.btcAvailableForTrading
            )}`}
            subText2={`Locked in orders: ${amountToUnitString(
              book.btcInOrders
            )}`}
            amountFontSize="14pt"
          />
          <CurrencyAmount
            currencyValue={book.daiTotal}
            topText="DAI"
            subText1={`Available: ${amountToUnitString(
              book.daiAvailableForTrading
            )}`}
            subText2={`Locked in orders: ${amountToUnitString(
              book.daiInOrders
            )}`}
            amountFontSize="14pt"
          />
          <CurrencyAmount
            currencyValue={book.ethTotal}
            topText="ETH"
            subText1={`Available: ${amountToUnitString(
              book.ethAvailableForTrading
            )}`}
            subText2={`Locked in orders: ${amountToUnitString(
              book.ethInOrders
            )}`}
            amountFontSize="14pt"
          />
        </Flex>
      </StatGroup>
    </div>
  );
}
