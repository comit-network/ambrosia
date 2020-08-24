import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex, FormControl, FormHelperText,
  FormLabel,
  Input,
  RadioButtonGroup,
  Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text
} from '@chakra-ui/core';
import {CurrencyValue, MarketOrder} from "./MarketOrderList";
import {ethers} from "ethers";

interface OrderCreatorProperties {
  highestPriceBuyOrder: MarketOrder;
  lowestPriceSellOrder: MarketOrder;
  daiAvailable: CurrencyValue;
  btcAvailable: CurrencyValue;
}

interface TabStyle {
  color: string;
  bg: string;
  lineColor: string;
}

export function calculateQuote(price: CurrencyValue, quantity: CurrencyValue): CurrencyValue {
  const satToAttoZeros = ethers.BigNumber.from("100000000");

  // Calc with sat as base
  let priceWei =  ethers.BigNumber.from(price.value); // Price in DAI(wei) for 1 BTC
  let quantitySat = ethers.BigNumber.from(quantity.value); // Quantity in BTC(sat)
  let priceSat = priceWei.div(satToAttoZeros);
  let quote = priceSat.mul(quantitySat);

  return {
    currency: "DAI",
    value: quote.toString(),
    decimals: 18
  };
}

export default function OrderCreator({highestPriceBuyOrder, lowestPriceSellOrder, daiAvailable, btcAvailable} : OrderCreatorProperties) {

  const sellColors = {
    text: "orange.800",
    bg: "orange.100",
    variant: "orange.800",
  };

  const buyColors = {
    text: "cyan.800",
    bg: "cyan.100",
    variant: "cyan.800",
  };

  return (
    <Flex direction="column">

      <Tabs isFitted >
        <TabList>
          <Tab _selected={{ color: buyColors.text, bg: buyColors.bg, borderBottom: "2px", borderBottomColor: buyColors.text }} fontWeight="bold">Buy</Tab>
          <Tab _selected={{ color: sellColors.text, bg: sellColors.bg, borderBottom: "2px", borderBottomColor: sellColors.text }} fontWeight="bold">Sell</Tab>
        </TabList>
        <TabPanels backgroundColor="white">
          <TabPanel>
            <Flex direction="column" padding="1rem">


                <Input type="number" id="price" aria-describedby="email-helper-text" />

                <Text></Text>



            </Flex>
          </TabPanel>
          <TabPanel>
            <p>two!</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
