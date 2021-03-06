import React, { useEffect, useReducer } from 'react';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/core';
import { BigNumber } from 'ethers';
import {
  myBuyOrderVariantColor,
  mySellOrderVariantColor
} from '../constants/colors';
import {
  amountToUnitString,
  BTC_FEE,
  btcIntoCurVal,
  calculateBaseFromAvailableQuote,
  calculateQuote,
  CurrencyValue,
  daiIntoCurVal,
  ETH_FEE,
  MIN_BTC,
  MIN_DAI,
  ZERO_DAI
} from '../utils/currency';
import { MarketOrder } from '../utils/market';
import { useLedgerEthereumWallet } from '../hooks/useLedgerEthereumWallet';
import { useLedgerBitcoinWallet } from '../hooks/useLedgerBitcoinWallet';
import { useCnd } from '../hooks/useCnd';
import { useConfig } from '../config';
import { mutate } from 'swr';

interface OrderCreatorProperties {
  highestPriceBuyOrder: MarketOrder;
  lowestPriceSellOrder: MarketOrder;
  daiAvailable: CurrencyValue;
  btcAvailable: CurrencyValue;
  ethAvailable: CurrencyValue;
}

enum Position {
  BUY = 'buy',
  SELL = 'sell'
}

interface State {
  position: Position;

  priceErrorMessage: string;
  quantityErrorMessage: string;
  quoteErrorMessage: string;

  maxQuantity: string;

  ethErrorMessage: string;

  price: string;
  quantity: string;
  quote: string;

  ethAvailable: CurrencyValue;
  daiAvailable: CurrencyValue;
  btcAvailable: CurrencyValue;
}

type Action =
  | {
      type: 'priceChange' | 'quantityChange';
      value: string;
    }
  | {
      type: 'update';
      value: State;
    };

const NUM_WITHOUT_SIGN_REGEX = new RegExp('^\\d+(\\.\\d+)?$');

function isSufficientBuyFunds(
  quote: CurrencyValue,
  availableDai: CurrencyValue
): boolean {
  const quoteBigNumber = BigNumber.from(quote.value);
  const availableDaiBigNumber = BigNumber.from(availableDai.value);

  return quoteBigNumber.lte(availableDaiBigNumber);
}

function maxBtcTradable(
  btcAvailable: CurrencyValue,
  btcFee: BigNumber
): BigNumber {
  const availableBtcBigNumber = BigNumber.from(btcAvailable.value);
  return availableBtcBigNumber.sub(btcFee);
}

function isSufficientSellFunds(
  quantity: CurrencyValue,
  availableBtc: CurrencyValue
) {
  const quantityBigNumber = BigNumber.from(quantity.value);

  return quantityBigNumber.lte(maxBtcTradable(availableBtc, BTC_FEE));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'priceChange':
      let quoteErrorMessage = '';
      const priceErrorMessage = '';
      const newPriceStr = action.value;

      if (!newPriceStr || newPriceStr === '') {
        return {
          ...state,
          price: action.value,
          quote: '',
          priceErrorMessage: 'Field cannot be empty',
          quoteErrorMessage: quoteErrorMessage
        };
      }

      if (!newPriceStr.match(NUM_WITHOUT_SIGN_REGEX)) {
        return {
          ...state,
          priceErrorMessage: 'Not a number',
          price: action.value,
          quote: '0',
          quoteErrorMessage: quoteErrorMessage
        };
      }

      // Needs quantity check, otherwise will error if both fields are empty and then one is changed
      if (!state.quantity || state.quantity === '') {
        return {
          ...state,
          price: action.value,
          quote: '',
          priceErrorMessage: priceErrorMessage,
          quantityErrorMessage: 'Field cannot be empty',
          quoteErrorMessage: quoteErrorMessage
        };
      }

      const newPrice = daiIntoCurVal(newPriceStr);
      const quantity = btcIntoCurVal(state.quantity);
      const newQuote = calculateQuote(newPrice, quantity);

      if (state.position === Position.BUY) {
        quoteErrorMessage = isSufficientBuyFunds(newQuote, state.daiAvailable)
          ? ''
          : 'Insufficient DAI to make this trade!';
      }

      return {
        ...state,
        price: action.value,
        quote: amountToUnitString(newQuote),
        priceErrorMessage: priceErrorMessage,
        quoteErrorMessage: quoteErrorMessage
      };
    case 'quantityChange': {
      let quoteErrorMessage = '';
      let quantityErrorMessage = '';
      const newQuantityStr = action.value;

      if (!newQuantityStr || newQuantityStr === '') {
        return {
          ...state,
          quantity: action.value,
          quote: '',
          quantityErrorMessage: 'Field cannot be empty',
          quoteErrorMessage: quoteErrorMessage
        };
      }

      if (!newQuantityStr.match(NUM_WITHOUT_SIGN_REGEX)) {
        return {
          ...state,
          quantityErrorMessage: 'Not a number',
          quantity: action.value,
          quote: '0',
          quoteErrorMessage: quoteErrorMessage
        };
      }

      // Needs price check, otherwise will error if both fields are empty and then one is changed
      if (!state.price || state.price === '') {
        return {
          ...state,
          quantity: action.value,
          quote: '',
          priceErrorMessage: 'Field cannot be empty',
          quantityErrorMessage: quantityErrorMessage,
          quoteErrorMessage: quoteErrorMessage
        };
      }

      const newQuantity = btcIntoCurVal(newQuantityStr);
      const price = daiIntoCurVal(state.price);
      const newQuote = calculateQuote(price, newQuantity);

      if (state.position === Position.BUY) {
        quoteErrorMessage = isSufficientBuyFunds(newQuote, state.daiAvailable)
          ? ''
          : 'Insufficient DAI to make this trade!';
      }

      if (state.position === Position.SELL) {
        quantityErrorMessage = isSufficientSellFunds(
          newQuantity,
          state.btcAvailable
        )
          ? ''
          : 'Insufficient BTC to make this trade!';
      }

      return {
        ...state,
        quantity: action.value,
        quote: amountToUnitString(newQuote),
        quantityErrorMessage: quantityErrorMessage,
        quoteErrorMessage: quoteErrorMessage
      };
    }
    case 'update': {
      // TODO: Extract the max/best and placeholder values and set them properly upon update

      const newState = action.value;

      return {
        ...state,
        btcAvailable: newState.btcAvailable,
        daiAvailable: newState.daiAvailable,
        ethAvailable: newState.ethAvailable,
        ethErrorMessage: newState.ethErrorMessage,
        maxQuantity: newState.maxQuantity
      };
    }
    default:
      throw new Error();
  }
}

interface FormProperties {
  initialState: State;
  label: string;
  variantColor: string;
}

function Form({ initialState, label, variantColor }: FormProperties) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [config] = useConfig();

  useEffect(() => {
    dispatch({
      type: 'update',
      value: initialState
    });
  }, [initialState]);

  const ethWallet = useLedgerEthereumWallet();
  const btcWallet = useLedgerBitcoinWallet();

  const cnd = useCnd();

  async function postBtcDaiOrder(
    position: Position,
    quantity: BigNumber,
    price: BigNumber
  ): Promise<string> {
    const sats = quantity;

    const weiPerDai = price;
    const satsPerBtc = BigNumber.from('100000000');
    const weiPerSat = weiPerDai.div(satsPerBtc);

    const body = {
      position,
      quantity: sats.toString(),
      price: weiPerSat.toString(),
      swap: {
        role: config.ROLE,
        // eslint-disable-next-line camelcase
        bitcoin_address: await btcWallet.getNewAddress(),
        // eslint-disable-next-line camelcase
        ethereum_address: ethWallet.getAccount()
      }
    };

    const response = await cnd.client.post('/orders/BTC-DAI', body);

    return response.headers.location;
  }

  return (
    <form
      onSubmit={async event => {
        event.preventDefault();

        if (
          state.ethErrorMessage ||
          state.priceErrorMessage ||
          state.quantityErrorMessage ||
          state.quoteErrorMessage
        ) {
          console.error('Error message active, cannot create order');
          return;
        }

        const quantityBigInt = BigNumber.from(
          btcIntoCurVal(state.quantity).value
        );
        const quoteBigInt = BigNumber.from(daiIntoCurVal(state.quote).value);

        const availableBtcBigInt = BigNumber.from(state.btcAvailable.value);
        const availableDaiBigInt = BigNumber.from(state.daiAvailable.value);

        if (state.position === Position.SELL) {
          if (availableBtcBigInt.lt(quantityBigInt)) {
            console.error('Insufficient BTC');
            return;
          }
        }

        if (state.position === Position.BUY) {
          if (availableDaiBigInt.lt(quoteBigInt)) {
            console.error('Insufficient DAI');
            return;
          }
        }

        const priceBigInt = BigNumber.from(daiIntoCurVal(state.price).value);

        await postBtcDaiOrder(state.position, quantityBigInt, priceBigInt);

        await mutate('/orders');
        await mutate('/balance/btc');
        await mutate('/balance/eth');
        await mutate('/balance/dai');
      }}
    >
      <fieldset disabled={state.ethErrorMessage != ''}>
        <FormControl isInvalid={state.ethErrorMessage != ''}>
          <FormErrorMessage>{state.ethErrorMessage}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={state.priceErrorMessage != ''}>
          <FormLabel htmlFor="price">Limit Price</FormLabel>
          <InputGroup>
            <InputLeftAddon padding="0.5rem">
              <Icon name="dai" size="20px" alignSelf="center" />
            </InputLeftAddon>
            <Input
              type="text"
              id="price"
              rounded="0"
              placeholder={initialState.price}
              value={state.price}
              onChange={event =>
                dispatch({
                  type: 'priceChange',
                  value: event.target.value
                })
              }
            />
            <InputRightAddon padding="0">
              <Button
                onClick={() =>
                  dispatch({ type: 'priceChange', value: initialState.price })
                }
                variantColor={variantColor}
              >
                best
              </Button>
            </InputRightAddon>
          </InputGroup>
          <FormErrorMessage>{state.priceErrorMessage}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={state.quantityErrorMessage != ''}>
          <FormLabel htmlFor="quantity">Quantity</FormLabel>
          <InputGroup>
            <InputLeftAddon padding="0.5rem">
              <Icon name="bitcoin" size="20px" alignSelf="center" />
            </InputLeftAddon>
            <Input
              type="text"
              id="quantity"
              rounded="0"
              placeholder={initialState.maxQuantity}
              value={state.quantity}
              onChange={event =>
                dispatch({ type: 'quantityChange', value: event.target.value })
              }
            />
            <InputRightAddon padding="0">
              <Button
                onClick={() =>
                  dispatch({
                    type: 'quantityChange',
                    value: initialState.maxQuantity
                  })
                }
                variantColor={variantColor}
              >
                max
              </Button>
            </InputRightAddon>
          </InputGroup>
          <FormErrorMessage>{state.quantityErrorMessage}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={state.quoteErrorMessage != ''}>
          <FormLabel htmlFor="quote">Quote</FormLabel>
          <InputGroup>
            <InputLeftAddon padding="0.5rem">
              <Icon name="dai" size="20px" alignSelf="center" />
            </InputLeftAddon>
            <Input
              type="text"
              id="quote"
              value={state.quote}
              isDisabled
              color="gray.800"
            />
          </InputGroup>
          <FormErrorMessage>{state.quoteErrorMessage}</FormErrorMessage>
        </FormControl>
        <Flex direction="row" width="100%" justifyContent="flex-end">
          <Button
            mt={4}
            variantColor={variantColor}
            type="submit"
            justifySelf="flex-end"
          >
            {label}
          </Button>
        </Flex>
      </fieldset>
    </form>
  );
}

export default function OrderCreator({
  highestPriceBuyOrder,
  lowestPriceSellOrder,
  daiAvailable,
  btcAvailable,
  ethAvailable
}: OrderCreatorProperties) {
  // Check if we have Ether for fees
  let ethErrorMessage = '';
  const ethBigNumber = BigNumber.from(ethAvailable.value);
  if (ethBigNumber.lt(ETH_FEE)) {
    ethErrorMessage = 'Insufficient ETH, add more to trade!';
  }

  let btcErrorMessage = '';
  const btcBigNumber = BigNumber.from(btcAvailable.value);
  if (btcBigNumber.lt(MIN_BTC)) {
    btcErrorMessage = 'Insufficient BTC, add more to trade!';
  }

  const daiErrorMessage = '';
  const daiBigNumber = BigNumber.from(daiAvailable.value);
  if (daiBigNumber.lt(MIN_DAI)) {
    btcErrorMessage = 'Insufficient DAI, add more to trade!';
  }

  const initialBuyPrice =
    lowestPriceSellOrder !== null ? lowestPriceSellOrder.price : ZERO_DAI;
  const initialBuyQuote = daiAvailable;
  const maxBuyQuantity = calculateBaseFromAvailableQuote(
    initialBuyPrice,
    initialBuyQuote
  );

  const initialBuyState: State = {
    position: Position.BUY,

    price: amountToUnitString(initialBuyPrice),
    quantity: '',
    quote: '',

    maxQuantity: amountToUnitString(maxBuyQuantity),

    priceErrorMessage: '',
    quantityErrorMessage: '',
    quoteErrorMessage: daiErrorMessage,

    ethErrorMessage: ethErrorMessage,

    ethAvailable: ethAvailable,
    daiAvailable: daiAvailable,
    btcAvailable: btcAvailable
  };

  const initialSellPrice =
    highestPriceBuyOrder !== null ? highestPriceBuyOrder.price : ZERO_DAI;
  const maxSellQuantity = btcIntoCurVal(maxBtcTradable(btcAvailable, BTC_FEE));

  const initialSellState: State = {
    position: Position.SELL,

    price: amountToUnitString(initialSellPrice),
    quantity: '',
    quote: '',

    maxQuantity: amountToUnitString(maxSellQuantity),

    priceErrorMessage: '',
    quantityErrorMessage: btcErrorMessage,
    quoteErrorMessage: '',

    ethErrorMessage: ethErrorMessage,

    ethAvailable: ethAvailable,
    daiAvailable: daiAvailable,
    btcAvailable: btcAvailable
  };

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
        <TabPanels>
          <TabPanel backgroundColor="white" height="100%">
            <Flex direction="column" padding="1rem">
              <Form
                initialState={initialBuyState}
                label={'Buy'}
                variantColor={myBuyOrderVariantColor}
              />
            </Flex>
          </TabPanel>
          <TabPanel backgroundColor="white" height="100%">
            <Flex direction="column" padding="1rem">
              <Form
                initialState={initialSellState}
                label={'Sell'}
                variantColor={mySellOrderVariantColor}
              />
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
