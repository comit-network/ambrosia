import React from 'react';
import {
  Flex,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text
} from '@chakra-ui/core';
import { CurrencyValue, MarketOrder } from '../utils/types';

interface OrderCreatorProperties {
  highestPriceBuyOrder: MarketOrder;
  lowestPriceSellOrder: MarketOrder;
  daiAvailable: CurrencyValue;
  btcAvailable: CurrencyValue;
}

export default function OrderCreator({
  highestPriceBuyOrder,
  lowestPriceSellOrder,
  daiAvailable,
  btcAvailable
}: OrderCreatorProperties) {
  const sellColors = {
    text: 'orange.800',
    bg: 'orange.100',
    variant: 'orange.800'
  };

  const buyColors = {
    text: 'cyan.800',
    bg: 'cyan.100',
    variant: 'cyan.800'
  };

  return (
    <Flex direction="column">
      <Tabs isFitted>
        <TabList>
          <Tab
            _selected={{
              color: buyColors.text,
              bg: buyColors.bg,
              borderBottom: '2px',
              borderBottomColor: buyColors.text
            }}
            fontWeight="bold"
          >
            Buy
          </Tab>
          <Tab
            _selected={{
              color: sellColors.text,
              bg: sellColors.bg,
              borderBottom: '2px',
              borderBottomColor: sellColors.text
            }}
            fontWeight="bold"
          >
            Sell
          </Tab>
        </TabList>
        <TabPanels backgroundColor="white">
          <TabPanel>
            <Flex direction="column" padding="1rem">
              <Input
                type="number"
                id="price"
                aria-describedby="email-helper-text"
              />

              <Text />
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
