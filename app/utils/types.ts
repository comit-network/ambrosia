import { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import { Action, Entity } from '../comit-sdk/cnd/siren';

// TODO: Remove once we deal with decimals instead
export enum Currency {
  BTC = 'BTC',
  DAI = 'DAI',
  ETH = 'ETH'
}

// TODO: Remove once we deal with decimals instead
export enum CurrencyUnit {
  BTC,
  SATOSHI,
  DAI,
  ATTO,
  ETHER,
  WEI
}

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
  actions: Action[];
}

export function intoOrders(response: AxiosResponse<Entity>): Order[] {
  return response.data.entities
    .map(order => {
      const { properties } = order;
      const { actions } = order;
      const typedOrder = properties as Order;
      typedOrder.actions = actions as Action[];
      return typedOrder;
    })
    .sort((order1, order2) => {
      const price1 = order1.price.value;
      const price2 = order2.price.value;
      if (price1 < price2) {
        return -1;
      }
      if (price1 > price2) {
        return 1;
      }
      return 0;
    });
}

export interface MarketOrder {
  id: string;
  position: string;
  price: CurrencyValue;
  quantity: CurrencyValue;
  ours: boolean;
  maker: string;
}

interface Market {
  buyOrders: MarketOrder[];
  sellOrders: MarketOrder[];
  highestBuyOrder: MarketOrder;
  lowestSellOrder: MarketOrder;
}

export function intoMarket(response: AxiosResponse<Entity>): Market {
  const marketOrders = response.data.entities.map(
    order => order.properties as MarketOrder
  );

  // sorted ascending by price
  const buyOrders = marketOrders
    .filter(order => order.position === 'buy')
    .sort((order1, order2) => {
      const price1 = order1.price.value;
      const price2 = order2.price.value;
      if (price1 < price2) {
        return -1;
      }
      if (price1 > price2) {
        return 1;
      }
      return 0;
    });
  // sorted descending by price
  const sellOrders = marketOrders
    .filter(order => order.position === 'sell')
    .sort((order1, order2) => {
      const price1 = order1.price.value;
      const price2 = order2.price.value;
      if (price1 < price2) {
        return 1;
      }
      if (price1 > price2) {
        return -1;
      }
      return 0;
    });

  const theirOrders = marketOrders.filter(order => !order.ours);
  const theirBuyOrders = theirOrders.filter(order => order.position === 'buy');
  const theirSellOrders = theirOrders.filter(
    order => order.position === 'sell'
  );
  // their highest buying price is my best selling price
  const highestBuyOrder = theirBuyOrders.reduce((a, b) =>
    a.quantity.value > b.quantity.value ? a : b
  );
  // their lowest selling price is my best buying price
  const lowestSellOrder = theirSellOrders.reduce((a, b) =>
    a.quantity.value < b.quantity.value ? a : b
  );

  return {
    sellOrders,
    buyOrders,
    highestBuyOrder,
    lowestSellOrder
  };
}

interface Book {
  btcTotal: CurrencyValue;
  daiTotal: CurrencyValue;
  ethTotal: CurrencyValue;

  btcInOrders: CurrencyValue;
  daiInOrders: CurrencyValue;
  ethInOrders: CurrencyValue;

  // available = total - inOrders
  btcAvailableForTrading: CurrencyValue;
  daiAvailableForTrading: CurrencyValue;
  ethAvailableForTrading: CurrencyValue;
}

export function calculateQuote(
  price: CurrencyValue,
  quantity: CurrencyValue
): CurrencyValue {
  const satToAttoZeros = ethers.BigNumber.from('100000000');

  // Calc with sat as base
  const priceWei = ethers.BigNumber.from(price.value); // Price in DAI(wei) for 1 BTC
  const quantitySat = ethers.BigNumber.from(quantity.value); // Quantity in BTC(sat)
  const priceSat = priceWei.div(satToAttoZeros);
  const quote = priceSat.mul(quantitySat);

  return {
    currency: 'DAI',
    value: quote.toString(),
    decimals: 18
  };
}

export function intoBook(
  btcBalance: CurrencyValue,
  daiBalance: CurrencyValue,
  ethBalance: CurrencyValue,
  orders: Order[]
): Book {
  console.log('into book...');

  if (!btcBalance || !daiBalance || !ethBalance || !orders) {
    // Not initialised yet...
    console.log(btcBalance);
    console.log(daiBalance);
    console.log(ethBalance);
    console.log(orders);
    return null;
  }

  // TODO Deal with this in a more elaborate way, potentially use the COMIT sdk
  const ethFeeBigNumber = ethers.BigNumber.from(420000000000000); // 21000 units of gas in wei (rough)

  const sumOfBtcInOrdersBigNumber = orders
    .filter(order => order.position === 'sell')
    .reduce((a, b) => {
      const quantity = ethers.BigNumber.from(b.quantity.value);
      return a.add(quantity);
    }, ethers.BigNumber.from(0));

  const myBuyOrders = orders.filter(order => order.position === 'buy');

  // The sum of DAI in orders is the amount of DAI in buy orders (buying BTC = selling DAI), defined by price and quantity
  const sumOfDaiInOrdersBigNumber = myBuyOrders.reduce((a, b) => {
    const quoteCurrencyVal = calculateQuote(b.price, b.quantity);
    const quote = ethers.BigNumber.from(quoteCurrencyVal.value);
    return a.add(quote);
  }, ethers.BigNumber.from(0));

  const numberOfbuyOrders = ethers.BigNumber.from(myBuyOrders.length);
  const sumOfEthInOrderFeesBigNumber = ethFeeBigNumber.mul(numberOfbuyOrders);

  const btcBalanceBigNumber = ethers.BigNumber.from(btcBalance.value);
  const daiBalanceBigNumber = ethers.BigNumber.from(daiBalance.value);
  const ethBalanceBigNumber = ethers.BigNumber.from(ethBalance.value);

  const availableBtcBigNumber = btcBalanceBigNumber.sub(
    sumOfBtcInOrdersBigNumber
  );
  const availableDaiBigNumber = daiBalanceBigNumber.sub(
    sumOfDaiInOrdersBigNumber
  );
  const availableEthBigNumber = ethBalanceBigNumber.sub(
    sumOfEthInOrderFeesBigNumber
  );

  return {
    btcTotal: btcBalance,
    daiTotal: daiBalance,
    ethTotal: ethBalance,

    btcInOrders: {
      currency: btcBalance.currency,
      value: sumOfBtcInOrdersBigNumber.toString(),
      decimals: btcBalance.decimals
    },
    daiInOrders: {
      currency: daiBalance.currency,
      value: sumOfDaiInOrdersBigNumber.toString(),
      decimals: daiBalance.decimals
    },
    ethInOrders: {
      currency: ethBalance.currency,
      value: sumOfEthInOrderFeesBigNumber.toString(),
      decimals: ethBalance.decimals
    },

    btcAvailableForTrading: {
      currency: btcBalance.currency,
      value: availableBtcBigNumber.toString(),
      decimals: btcBalance.decimals
    },
    daiAvailableForTrading: {
      currency: daiBalance.currency,
      value: availableDaiBigNumber.toString(),
      decimals: daiBalance.decimals
    },
    ethAvailableForTrading: {
      currency: ethBalance.currency,
      value: availableEthBigNumber.toString(),
      decimals: ethBalance.decimals
    }
  };
}
