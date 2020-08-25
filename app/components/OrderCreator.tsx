import React from 'react';
import {
  Button,
  Flex, FormControl, FormErrorMessage, FormLabel,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text
} from '@chakra-ui/core';
import { CurrencyValue, MarketOrder } from '../utils/types';
import {Field, Formik} from "formik";

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


  function validateSufficientBtc(amount: string) {
    let error;
    if (!amount) {
      error = "Please specify an";
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
                  initialValues={{ name: "Sasuke" }}
                  onSubmit={(values, actions) => {
                    setTimeout(() => {
                      alert(JSON.stringify(values, null, 2));
                      actions.setSubmitting(false);
                    }, 1000);
                  }}
              >
                {props => (
                    <form onSubmit={props.handleSubmit}>
                      <Field name="name" validate={validateSufficientBtc}>
                        {({ field, form }) => (
                            <FormControl isInvalid={form.errors.name && form.touched.name}>
                              <FormLabel htmlFor="name">Buy Quantity (BTC)</FormLabel>
                              <Input {...field} id="name" placeholder="quantity" />
                              <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                            </FormControl>
                        )}
                      </Field>
                      <Button
                          mt={4}
                          variantColor="cyan"
                          isLoading={props.isSubmitting}
                          type="submit"
                      >
                        Submit
                      </Button>
                    </form>
                )}
              </Formik>

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
