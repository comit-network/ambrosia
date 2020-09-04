import React from 'react';
import { Flex } from '@chakra-ui/core';
import CurrencyAmount, { ColorMode } from './CurrencyAmount';
import { MarketOrder } from '../utils/market';
import { ZERO_DAI } from '../utils/currency';

interface BidAndAskProperties {
  lowestSellOrder: MarketOrder;
  highestBuyOrder: MarketOrder;
}

export default function BidAndAsk({
  lowestSellOrder,
  highestBuyOrder
}: BidAndAskProperties) {
  let lowestSellPrice = ZERO_DAI;
  let highestBuyPrice = ZERO_DAI;

  if (lowestSellOrder) {
    lowestSellPrice = lowestSellOrder.price;
  }
  if (highestBuyOrder) {
    highestBuyPrice = highestBuyOrder.price;
  }

  return (
    <Flex direction="row">
      <CurrencyAmount
        currencyValue={lowestSellPrice}
        topText="Bid"
        colourMode={ColorMode.RED}
        noImage
      />
      <CurrencyAmount
        currencyValue={highestBuyPrice}
        topText="Ask"
        colourMode={ColorMode.GREEN}
        noImage
      />
    </Flex>
  );
}
