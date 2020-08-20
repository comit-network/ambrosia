import React from 'react';
import {Box, Divider, Flex, Stack, TagLabel, Text} from '@chakra-ui/core';
import SwapList from '../components/SwapList';
import OrderCreator from '../components/OrderCreator';
import AvailableBalance from '../components/AvailableBalance';
import {mockMarketsBtcDai, mockOrders} from "../components/MockData";
import CurrencyAmount, {Currency, CurrencyUnit} from "../components/CurrencyAmount";
import MarketOrderList, {MarketOrder} from "../components/MarketOrderList";


// Learnings:
// 1. Swaps have individual state, thus the Swap component has to handle it's own state.
// 2. Orders don't change (they don't have state), the only action one can do on them is "cancel" - orders are handled globally
// 3. Balances don't have state, and we need them for calculation with orders, so I suppose we have to handle the on the page as well.

export default function DashboardPage() {

    // TODO: useSWR to fetch from cnd
    let orders = mockMarketsBtcDai().data.entities;

    // TODO: pass to market buy orders view
    let buyOrders = orders.filter((order) => order.properties.position === "buy")
        .sort((order1, order2) =>
            order2.properties.price.value - order1.properties.price.value)
        .map((order) => order.properties as MarketOrder);
    // TODO: pass to market sell orders view
    let sellOrders = orders.filter((order) => order.properties.position === "sell")
        .sort((order1, order2) =>
            order1.properties.price.value - order2.properties.price.value)
        .map((order) => order.properties as MarketOrder);

    // TODO: This hast STATE, handle inside MyOrder component
    let myOrders = mockOrders().data;


    let theirOrders = orders.filter((order) => !order.properties.ours);
    let theirBuyOrders = theirOrders.filter((order) => order.properties.position === "buy");
    let theirSellOrders = theirOrders.filter((order) => order.properties.position === "sell");
    // TODO: pass to market best buy
    // their highest buying price is my best selling price
    let theirBestBuyOrder = theirBuyOrders.reduce((acc, loc) => acc.properties.quantity.value > loc.properties.quantity.value ? acc : loc);
    // TODO: pass to market best sell
    // their lowest selling price is my best buying price
    let theirBestSellOrder = theirSellOrders.reduce((acc, loc) => acc.properties.quantity.value < loc.properties.quantity.value ? acc : loc);
    let theirBestBuyPrice = theirBestBuyOrder.properties.price;
    let theirBestSellPrice = theirBestSellOrder.properties.price;

    return (
        <Flex direction="column" width="100%" minHeight="100%">
            {/* Market Data */}
            <Flex direction="row" width="100%">

                {/* Best Bid / Ask*/}
                <Box minWidth="200px" maxHeight="200px" padding="1rem" backgroundColor="white" shadow="md" marginRight="1rem">
                    <Stack>
                        <CurrencyAmount amount={theirBestSellPrice.value} currency={Currency.DAI}
                                        unit={CurrencyUnit.ATTO} topText="Best Sell Price" subText1="for 1 BTC"/>
                        <CurrencyAmount amount={theirBestBuyPrice.value} currency={Currency.DAI}
                                        unit={CurrencyUnit.ATTO} topText="Best Buy Price" subText1="for 1 BTC"/>
                    </Stack>
                </Box>

                {/* Market orders*/}
                <Flex direction="row" width="100%" justifyContent="space-between">
                    <MarketOrderList orders={buyOrders} label={"Buy Orders"} />
                    <MarketOrderList orders={sellOrders} label={"Sell Orders"} />
                </Flex>
            </Flex>


            <Flex flexDirection="row" width="100%" maxHeight="300px" marginTop="1rem">
                {/* Device Status */}
                <Flex background="white" minWidth="200px" maxWidth="200px" shadow="md" marginRight="1rem">
                    <Text> Status of ledger and blockchain nodes</Text>
                </Flex>

                {/* Ongoing Swaps */}
                <Flex direction="column" background="white" width="100%" overflow="scroll" shadow="md">
                    <Box width="100%" backgroundColor="gray.600" marginBottom="0.5rem">
                        <TagLabel paddingLeft="0.5rem" paddingTop="0.5" fontSize="md" color="white" fontWeight="bold">Swaps</TagLabel>
                    </Box>
                    <SwapList/>
                </Flex>
            </Flex>

            <Flex
                flexDirection="row"
                width="100%"
                minHeight="300px"
                maxHeight="300px"
                marginTop="1rem"
            >
                <Flex
                    background="white"
                    minWidth="200px"
                    maxWidth="200px"
                    padding="1rem"
                    shadow="md"
                    marginRight="1rem"
                >

                    {/* Balance Overview */}
                    <AvailableBalance/>
                </Flex>

                {/* Create Orders */}
                <Flex direction="column" background="white" minWidth="400px" shadow="md">
                    <Box width="100%" backgroundColor="gray.600">
                        <TagLabel paddingLeft="0.5rem" paddingTop="0.5" fontSize="md" color="white" fontWeight="bold">Order Creator</TagLabel>
                    </Box>
                    <Box padding="1rem">
                        <OrderCreator/>
                    </Box>
                </Flex>

                <Divider orientation="vertical"/>

                {/* My Order list */}
                <Flex background="white" width="100%" overflow="scroll">
                    <Stack>
                        <Text>Bla</Text>
                    </Stack>
                </Flex>
            </Flex>
        </Flex>
    );
}
