import React from 'react';
import {Badge, Box, Flex, TagLabel, Text} from "@chakra-ui/core";
import {EmbeddedRepresentationSubEntity} from "../comit-sdk/cnd/siren";
import CurrencyAmount, {Currency, CurrencyUnit} from "./CurrencyAmount";
import {Properties} from "../comit-sdk/cnd/swaps_payload";

export interface CurrencyValue {
    currency: string;
    value: string;
    decimals: number;
}

export interface MarketOrder {
    id: string;
    position: string;
    price: CurrencyValue;
    quantity: CurrencyValue;
    ours: boolean;
    maker: string;
}

export interface MarketOrderProperties {
    orders: MarketOrder[];
    label: string;
}

export default function MarketOrderList({ orders, label }: MarketOrderProperties) {

    const priceColWidth = "150px";
    const quantityColWidth = "150px";
    const makerColWidth = "150px";

    const marketOrderRow = orders.map((order) => (
            <Flex key={order.id} direction="row" alignContent="center"  borderBottom="1px" borderBottomColor="gray.200" marginTop="0.3rem" marginBottom="0.3rem">
                <Box width={priceColWidth} paddingLeft="0.5rem">
                    <CurrencyAmount amount={order.price.value} currency={Currency.DAI} unit={CurrencyUnit.ATTO}
                                    amountFontSize="sm" iconHeight="1rem" amountShortenPosition={4}/>
                </Box>
                <Box width={quantityColWidth} paddingLeft="0.5rem">
                    <CurrencyAmount amount={order.quantity.value} currency={Currency.BTC} unit={CurrencyUnit.SATOSHI}
                                    amountFontSize="sm" iconHeight="1rem" amountShortenPosition={4}/>
                </Box>
                <Box width={makerColWidth} paddingLeft="0.5rem">
                    {
                        order.ours
                            ? <Badge>You Order</Badge>
                            : <Text>{order.maker}</Text>
                    }
                </Box>
            </Flex>
        )
    );

    return (
        <Box backgroundColor="white" shadow="md" minHeight="200px">
            <Box width="100%" backgroundColor="gray.600">
                <TagLabel paddingLeft="0.5rem" paddingTop="0.5" fontSize="md" color="white" fontWeight="bold">{label}</TagLabel>
            </Box>
            <Box d="flex" alignItems="baseline" width="100%" >
                <Box width={priceColWidth} borderRight="1px" borderColor="white" backgroundColor="gray.500">
                    <TagLabel paddingLeft="0.5rem" color="white">Price</TagLabel>
                </Box>
                <Box width={quantityColWidth} backgroundColor="gray.500">
                    <TagLabel paddingLeft="0.5rem" color="white">Quantity</TagLabel>
                </Box>
                <Box width={makerColWidth} backgroundColor="gray.500">
                    <TagLabel paddingLeft="0.5rem" color="white">Maker</TagLabel>
                </Box>
            </Box>
            <Box overflow="scroll" width="100%">
                {marketOrderRow}
            </Box>
        </Box>
    );
}
