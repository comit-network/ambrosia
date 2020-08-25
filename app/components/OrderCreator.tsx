import React, {useState} from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text
} from '@chakra-ui/core';
import {
  amountToUnitString,
  BTC_SYMBOL,
  calculateBaseFromAvailableQuote,
  CurrencyValue,
  DAI_SYMBOL,
  MarketOrder
} from '../utils/types';
import {Field, Formik} from "formik";

interface OrderCreatorProperties {
  highestPriceBuyOrder: MarketOrder;
  lowestPriceSellOrder: MarketOrder;
  daiAvailable: CurrencyValue;
  btcAvailable: CurrencyValue;
  ethAvailable: CurrencyValue;
}

export default function OrderCreator({
  highestPriceBuyOrder,
  lowestPriceSellOrder,
  daiAvailable,
  btcAvailable,
    ethAvailable
}: OrderCreatorProperties) {


  function validateSufficientBtc(quantity: string) {
    let error;
    if (!quantity) {
      error = "Please specify amount";
    }
    return error;
  }

  function validateSufficientDai(amount: string) {
    let error;
    if (!amount) {
      error = "Please specify amount";
    } else if (amount !== "Naruto") {
      error = "Insufficient BTC";
    }
    return error;
  }

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

  const initialBuyPrice = lowestPriceSellOrder.price;
  const initialBuyQuantity = calculateBaseFromAvailableQuote(lowestPriceSellOrder.price, daiAvailable);
  const initialBuyQuote = daiAvailable;

  const [buyPrice, setBuyPrice] = useState(initialBuyPrice);
  const [buyQuantity, setBuyQuantity] = useState(initialBuyQuantity);
  const [buyQuote, setBuyQuote] = useState(initialBuyQuote);

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
              <Formik
                  initialValues={{
                    buyPrice: amountToUnitString(initialBuyPrice),
                  }}
                  onSubmit={(values, actions) => {
                    // TODO  handle create BUY order
                  }}
              >
                {props => (
                    <form onSubmit={props.handleSubmit}>
                      <Field name="buyPrice">
                        {({ field, form }) => (
                            <FormControl isInvalid={form.errors.buyPrice && form.touched.buyPrice}>
                              <FormLabel htmlFor="buyPrice">Limit Price</FormLabel>
                              <InputGroup>
                                // ₿
                                <InputLeftElement color="gray.300" fontSize="1.2em" children={DAI_SYMBOL}/>
                                <Input type="number" {...field} id="buyPrice" placeholder={amountToUnitString(initialBuyPrice)} />
                              </InputGroup>
                              <FormErrorMessage>{form.errors.buyPrice}</FormErrorMessage>
                            </FormControl>
                        )}
                      </Field>
                      <Field name="quantity" validate={validateSufficientBtc}>
                        {({ field, form }) => (
                            <FormControl isInvalid={form.errors.quantity && form.touched.quantity}>
                              <FormLabel htmlFor="quantity">Quantity</FormLabel>
                              <InputGroup>
                                <InputLeftElement color="gray.300" fontSize="1.2em" children={BTC_SYMBOL}/>
                                <Input type="number" {...field} id="quantity" placeholder={amountToUnitString(initialBuyQuantity)} />
                              </InputGroup>
                              <FormErrorMessage>{form.errors.quantity}</FormErrorMessage>
                            </FormControl>
                        )}
                      </Field>
                      <Field name="quote" validate={validateSufficientBtc}>
                        {({ field, form }) => (
                            <FormControl isInvalid={form.errors.quote && form.touched.quote}>
                              <FormLabel htmlFor="quote">Quote</FormLabel>
                              <InputGroup>
                                <InputLeftElement color="gray.300" fontSize="1.2em" children={DAI_SYMBOL}/>
                                <Input type="number" {...field} id="quote" placeholder={amountToUnitString(initialBuyQuote)} />
                              </InputGroup>
                              <FormErrorMessage>{form.errors.quote}</FormErrorMessage>
                            </FormControl>
                        )}
                      </Field>
                      <Flex direction="row" width="100%" justifyContent="flex-end">
                        <Button
                            mt={4}
                            variantColor="cyan"
                            isLoading={props.isSubmitting}
                            type="submit"
                            justifySelf="flex-end"
                        >
                          Buy
                        </Button>
                      </Flex>

                    </form>
                )}
              </Formik>

            </Flex>
          </TabPanel>
          <TabPanel>
            <Text>bla</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
