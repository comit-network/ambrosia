import React from 'react';
import { Box, Flex, IconButton, Text } from '@chakra-ui/core';
import CurrencyAmount, { ColorMode } from './CurrencyAmount';
import { Action } from '../comit-sdk/cnd/siren';
import { calculateQuote, Order } from '../utils/types';

export interface MarketOrderProperties {
  orders: Order[];
  label?: string;
  tableContentHeightLock?: string;
}

const myOrderSellBackgroundColour = 'orange.600';
const myOrderBuyBackgroundColour = 'cyan.600';

function getColorForOrder(order: Order): string {
  return order.position === 'buy'
    ? myOrderBuyBackgroundColour
    : myOrderSellBackgroundColour;
}

function cancel(action: Action) {
  if (action && action.name === 'cancel') {
    // TODO: Call cnd to cancel action
    // TODO: Manual trigger refresh needed?
    console.log(`Cancel order: ${action.href}`);
  }
}

export default function MyOrderList({
  orders,
  label,
  tableContentHeightLock
}: MarketOrderProperties) {
  const rows = [];

  const currencyValueWidth = '30%';
  const openAmountWidth = '10%';
  const cancelButtonWidth = '30px';

  const currencyValuePadding = '0.3rem';
  const marginTopBottom = '0.3rem';

  for (const order of orders) {
    const displayColorMode = ColorMode.WHITE;
    const quote = calculateQuote(order.price, order.quantity);

    rows.push(
      <Flex>
        <Flex
          direction="row"
          key={`price-${order.id}`}
          padding={currencyValuePadding}
          backgroundColor={getColorForOrder(order)}
          marginBottom={marginTopBottom}
          marginTop={marginTopBottom}
          alignItems="center"
        >
          <Box width={cancelButtonWidth}>
            <IconButton
              size="xs"
              aria-label="cancel"
              icon="close"
              onClick={() => cancel(order.actions[0])}
            />
          </Box>
        </Flex>
        <Box width={currencyValueWidth}>
          <CurrencyAmount
            currencyValue={order.price}
            amountFontSize="sm"
            iconHeight="1rem"
            colourMode={displayColorMode}
          />
        </Box>
        <Box width={currencyValueWidth}>
          <CurrencyAmount
            currencyValue={order.quantity}
            amountFontSize="sm"
            iconHeight="1rem"
            colourMode={displayColorMode}
          />
        </Box>
        <Box width={currencyValueWidth}>
          <CurrencyAmount
            currencyValue={quote}
            amountFontSize="sm"
            iconHeight="1rem"
            colourMode={displayColorMode}
          />
        </Box>
        <Box width={openAmountWidth}>
          <Text color={displayColorMode}>{`${+order.state.open * 100}%`}</Text>
        </Box>
      </Flex>
    );
  }

  const currencyValHeader = text => {
    return (
      <Box h="25px" paddingTop="0.1rem" width={currencyValueWidth}>
        <Text fontSize="sd" fontWeight="bold">
          {text}
        </Text>
      </Box>
    );
  };

  return (
    <Box>
      <Box padding="0.2rem">
        <Text textShadow="md" fontSize="lg">
          {label}
        </Text>
      </Box>
      <Box boxShadow="md">
        <Flex
          direction="row"
          paddingRight={currencyValuePadding}
          paddingLeft={currencyValuePadding}
        >
          <Box width={cancelButtonWidth} />
          {currencyValHeader('Price')}
          {currencyValHeader('Quantity')}
          {currencyValHeader('Quote')}
          <Box h="25px" paddingTop="0.1rem" width={openAmountWidth}>
            <Text fontSize="sd" fontWeight="bold">
              Open
            </Text>
          </Box>
        </Flex>
        <Flex
          direction="column"
          overflow="scroll"
          maxHeight={tableContentHeightLock}
        >
          {rows}
          {rows}
        </Flex>
      </Box>
    </Box>
  );
}
