import React, {useState} from 'react';
import {Button, Divider, Flex, FormLabel, Input, RadioButtonGroup, Stack, Text} from "@chakra-ui/core";
import {mockComitMarketData} from "./MockData";
import {Switch} from "@chakra-ui/core";

export interface OrderCreatorProperties {

}

// TODO: Consider using InputGroup for better styling, plant in some icons...
const rowItem = (label: string, value: number, isDisabled: boolean, isPrefilled?: boolean) => {

    // let input = <Text border="1px" borderColor="gray" borderRadius="md">{value.toString()}</Text>;

    let input = <Input key={label + isPrefilled} placeholder={value.toString()} isDisabled={isDisabled} />;

    if (isPrefilled) {
        input = <Input key={label + isPrefilled} value={value} placeholder={value.toString()} isDisabled={isDisabled}/>;
    }

    // TODO: Add image at the end
    return (
      <Flex direction="row" align="center">
          <FormLabel fontSize="10pt" minWidth="100px" maxWidth="100px">{label}</FormLabel>
          {input}
      </Flex>
    );

};

const CustomRadio = React.forwardRef((props, ref) => {
    const { isChecked, isDisabled, value, ...rest } = props;
    return (
        <Button
            ref={ref}
            variantColor={isChecked ? "blue" : "gray"}
            aria-checked={isChecked}
            role="radio"
            isDisabled={isDisabled}
            {...rest}
            fontSize="10pt"
            height="30px"
        />
    );
});



export default function OrderCreator() {

    const [isMarketOrder, setIsMarketOrder] = useState(true);
    const [isBuyOrder, setIsBuyOrder] = useState(true);

    const comitMarketData = mockComitMarketData();

    const mockBuyPrice = 9100.0;
    const mockSellPrice = 9000.0;
    const availableDaiBalance = 12345;
    const avaiableBtcBalance = 1.2345;

    return (
        <Flex direction="column" padding="1rem">
            <Flex justify="left" align="center" marginBottom="1rem">
                <RadioButtonGroup
                    defaultValue="select-buy"
                    isInline
                    onChange={() => setIsBuyOrder(!isBuyOrder)}
                >
                    <CustomRadio value="select-buy">Buy</CustomRadio>
                    <CustomRadio value="select-sell">Sell</CustomRadio>
                </RadioButtonGroup>
                <Divider orientation="vertical" />
                <RadioButtonGroup
                    defaultValue="select-market"
                    isInline
                    onChange={() => setIsMarketOrder(!isMarketOrder)}
                >
                    <CustomRadio value="select-market">Market</CustomRadio>
                    <CustomRadio value="select-limit">Limit</CustomRadio>
                </RadioButtonGroup>
            </Flex>
            <Stack>
                {/* TODO: Rethink this, probably better less generic...*/}
                {/* TODO: Subtext for DAI displaying approx ETH tx costs */}
                {/* TODO: Potentially: Display BTC tx costs?*/}
                {rowItem( isMarketOrder ? "Best Price" : "Set Price", isBuyOrder ? mockSellPrice : mockBuyPrice, isMarketOrder, isMarketOrder)}
                {rowItem( isBuyOrder ? "Give DAI" : " Give BTC", isBuyOrder ? availableDaiBalance : avaiableBtcBalance, false, false)}
                {rowItem(  isBuyOrder ? "Get BTC" : "Get DAI", 0, true, true)}
            </Stack>
            <Flex direction="column" align="right" width="100%" marginTop="1rem">
                <Button>{isBuyOrder ? "Buy BTC with DAI" : "Sell BTC for DAI"}</Button>
            </Flex>
        </Flex>
    );
}
