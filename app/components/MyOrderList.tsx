import React from 'react';
import {Box, Button, Flex, Grid, IconButton, Text} from '@chakra-ui/core';
import CurrencyAmount, {ColorMode, Currency, CurrencyUnit} from './CurrencyAmount';
import {ethers} from "ethers";
import {calculateQuote} from "./OrderCreator";

export interface CurrencyValue {
    currency: string;
    value: string;
    decimals: number;
}

export interface OrderState {
    open: string;
    closed: string;
    settling: string;
    failed: string;
}

export interface Order {
    id: string;
    position: string;
    price: CurrencyValue;
    quantity: CurrencyValue;
    state: OrderState;
}

export interface MarketOrderProperties {
    orders: Order[];
    label?: string;
    tableContentHeightLock?: string;
}

const myOrderSellBackgroundColour = "orange.600"
const myOrderBuyBackgroundColour = "cyan.600"

function getColorForOrder(order: Order): string {

    return order.position === "buy" ? myOrderBuyBackgroundColour : myOrderSellBackgroundColour;
}

export default function MyOrderList({
                                            orders,
                                            label,
    tableContentHeightLock
                                        }: MarketOrderProperties) {

    let rows = [];

    // TODO: Splitup like Swap and SwapList, then handle hrefs

    const currencyValueWidth = "30%";
    const openAmountWidth = "10%";
    const cancelButtonWidth = "25px";

    const currencyValuePadding = "0.3rem";
    const marginTopBottom = "0.3rem";

    for (let order of orders) {
        let displayColorMode = ColorMode.WHITE;
        let quote = calculateQuote(order.price, order.quantity);

        rows.push(
            (
                <Flex direction="row" key={`price-${order.id}`} padding={currencyValuePadding} backgroundColor={getColorForOrder(order)} marginBottom={marginTopBottom} marginTop={marginTopBottom} alignItems="center">
                    <Box width={currencyValueWidth}>
                        <CurrencyAmount
                            amount={order.price.value}
                            currency={Currency.DAI}
                            unit={CurrencyUnit.ATTO}
                            amountFontSize="sm"
                            iconHeight="1rem"
                            colourMode={displayColorMode}
                        />
                    </Box>
                    <Box width={currencyValueWidth}>
                        <CurrencyAmount
                            amount={order.quantity.value}
                            currency={Currency.BTC}
                            unit={CurrencyUnit.SATOSHI}
                            amountFontSize="sm"
                            iconHeight="1rem"
                            colourMode={displayColorMode}
                        />
                    </Box>
                    <Box width={currencyValueWidth}>
                        <CurrencyAmount
                            amount={quote.value}
                            currency={Currency.DAI}
                            unit={CurrencyUnit.ATTO}
                            amountFontSize="sm"
                            iconHeight="1rem"
                            colourMode={displayColorMode}
                        />
                    </Box>
                    <Box width={openAmountWidth}>
                        <Text color={displayColorMode}>{`${+order.state.open * 100}%`}</Text>
                    </Box>
                    <Box width={cancelButtonWidth}>
                        <IconButton size="xs" aria-label={"cancel"} icon={"close"} />
                    </Box>
                </Flex>
            ));

    }

    const currencyValHeader = (text) => {
        return (<Box h="25px" paddingTop="0.1rem" width={currencyValueWidth}>
            <Text fontSize="sd" fontWeight="bold">{text}</Text>
        </Box>);
    }

    return (
        <Box>
            <Box padding="0.2rem">
                <Text textShadow="md" fontSize="lg">{label}</Text>
            </Box>
            <Box boxShadow="md">
                <Flex direction="row" paddingRight={currencyValuePadding} paddingLeft={currencyValuePadding}>
                    {currencyValHeader("Price")}
                    {currencyValHeader("Quantity")}
                    {currencyValHeader("Quote")}
                    <Box h="25px" paddingTop="0.1rem" width={openAmountWidth}>
                        <Text fontSize="sd" fontWeight="bold">Open</Text>
                     </Box>
                    <Box width={cancelButtonWidth}/>
                </Flex>
                <Flex direction="column" overflow="scroll" maxHeight={tableContentHeightLock}>
                    {rows}
                    {rows}
                </Flex>
            </Box>
        </Box>
    );
}
