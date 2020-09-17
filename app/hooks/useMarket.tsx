import useSWR from 'swr/esm/use-swr';
import { useCnd } from './useCnd';
import { Market, MarketOrder } from '../utils/market';
import { AxiosResponse } from 'axios';
import { Entity } from '../comit-sdk/cnd/siren';

export const EMPTY_MARKET = {
  buyOrders: [],
  sellOrders: [],
  highestBuyOrder: null,
  lowestSellOrder: null
};

export function intoMarket(response: AxiosResponse<Entity>): Market {
  if (!response || !response.data) {
    return EMPTY_MARKET;
  }

  const marketOrders = response.data.entities.map(
    order => order.properties as MarketOrder
  );

  if (!marketOrders || marketOrders.length === 0) {
    return EMPTY_MARKET;
  }

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

  let highestBuyOrder = null;
  let lowestSellOrder = null;

  if (theirBuyOrders && theirBuyOrders.length > 1) {
    // their highest buying price is my best selling price
    highestBuyOrder = theirBuyOrders.reduce((a, b) => {
      if (a === null) {
        return b;
      }
      if (b === null) {
        return a;
      }

      return a.quantity.value > b.quantity.value ? a : b;
    }, null);
  }

  if (theirSellOrders && theirSellOrders.length > 1) {
    // their lowest selling price is my best buying price
    lowestSellOrder = theirSellOrders.reduce((a, b) => {
      if (a === null) {
        return b;
      }
      if (b === null) {
        return a;
      }

      return a.quantity.value < b.quantity.value ? a : b;
    }, null);
  }

  if (theirBuyOrders.length === 1) {
    highestBuyOrder = theirBuyOrders[0];
  }
  if (theirSellOrders.length === 1) {
    lowestSellOrder = theirSellOrders[0];
  }

  const result = {
    sellOrders,
    buyOrders,
    highestBuyOrder,
    lowestSellOrder
  };

  return result;
}

export default function useMarket() {
  const cnd = useCnd();

  const { data: marketResponse, error: error } = useSWR(
    '/markets/BTC-DAI',
    key => cnd.fetch(key),
    {
      refreshInterval: 1000
    }
  );

  if (!marketResponse || error) {
    return {
      ...EMPTY_MARKET,
      isLoading: true
    };
  }

  return intoMarket(marketResponse);
}
