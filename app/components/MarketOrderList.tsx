import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/core';
import CurrencyAmount, { ColorMode } from './CurrencyAmount';
import { MarketOrder } from '../utils/types';
import {
  myBuyOrderBackgroundColour,
  mySellOrderBackgroundColour
} from '../constants/colors';

export interface MarketOrderProperties {
  orders: MarketOrder[];
  label?: string;
  tableContentHeightLock?: string;
}

export default function MarketOrderList({
  orders,
  label,
  tableContentHeightLock
}: MarketOrderProperties) {
  const rows = [];

  const currencyValueWidth = '50%';

  const currencyValuePadding = '0.3rem';
  const marginTopBottom = '0.05rem';

  for (const order of orders) {
    let backgroundColor;
    let displayColorMode;

    if (order.position === 'buy') {
      if (order.ours) {
        displayColorMode = ColorMode.CYAN;
        backgroundColor = myBuyOrderBackgroundColour;
      } else {
        displayColorMode = ColorMode.GREEN;
      }
    } else if (order.ours) {
      displayColorMode = ColorMode.ORANGE;
      backgroundColor = mySellOrderBackgroundColour;
    } else {
      displayColorMode = ColorMode.RED;
    }

    rows.push(
      <Flex
        direction="row"
        key={`price-${order.id}`}
        padding={currencyValuePadding}
        marginBottom={marginTopBottom}
        marginTop={marginTopBottom}
        alignItems="center"
        backgroundColor={backgroundColor}
      >
        <Box width={currencyValueWidth}>
          <CurrencyAmount
            currencyValue={order.price}
            amountFontSize="sm"
            iconHeight="1rem"
            colourMode={displayColorMode}
            noImage
            minWidth="50px"
          />
        </Box>
        <Box width={currencyValueWidth}>
          <CurrencyAmount
            currencyValue={order.quantity}
            amountFontSize="sm"
            iconHeight="1rem"
            colourMode={displayColorMode}
            noImage
            minWidth="50px"
          />
        </Box>
      </Flex>
    );
  }

  const currencyValHeader = (text, subText) => {
    return (
      <Flex
        direction="row"
        h="25px"
        paddingTop="0.1rem"
        width={currencyValueWidth}
      >
        <Text fontSize="sd" fontWeight="bold" marginRight="0.3rem">
          {text}
        </Text>
        <Text fontSize="xs" fontWeight="bold" color="gray.600">
          {subText}
        </Text>
      </Flex>
    );
  };

  return (
    <Box>
      <Box padding="0.2rem">
        <Text textShadow="md" fontSize="lg">
          {label}
        </Text>
      </Box>
      <Box>
        <Flex
          direction="row"
          paddingRight={currencyValuePadding}
          paddingLeft={currencyValuePadding}
        >
          {currencyValHeader('Price', 'DAI')}
          {currencyValHeader('Quantity', 'BTC')}
        </Flex>
        <Flex
          direction="column"
          overflow="scroll"
          height={tableContentHeightLock}
        >
          {rows}
        </Flex>
      </Box>
    </Box>
  );
}
