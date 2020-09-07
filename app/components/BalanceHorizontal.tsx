import React from 'react';
import { Flex, StatGroup } from '@chakra-ui/core';
import CurrencyAmount from './CurrencyAmount';
import { amountToUnitString } from '../utils/currency';
import { intoOrders } from '../utils/order';
import { intoBook } from '../utils/book';
import { useCnd } from '../hooks/useCnd';
import useSWR from 'swr/esm/use-swr';
import useEtherBalance from '../hooks/useEtherBalance';
import useDaiBalance from '../hooks/useDaiBalance';
import useBitcoinBalance from '../hooks/useBitcoinBalance';

export default function BalanceHorizontal() {
  const cnd = useCnd();
  const ethBalanceAsCurrencyValue = useEtherBalance();
  const daiBalanceAsCurrencyValue = useDaiBalance();
  const btcBalanceAsCurrencyValue = useBitcoinBalance();

  const ordersEndpoint = '/orders';
  const { data: orders } = useSWR(
    () => ordersEndpoint,
    () => cnd.fetch(ordersEndpoint).then(intoOrders),
    {
      refreshInterval: 1000,
      initialData: []
    }
  );

  const book = intoBook(
    btcBalanceAsCurrencyValue,
    daiBalanceAsCurrencyValue,
    ethBalanceAsCurrencyValue,
    orders
  );

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
