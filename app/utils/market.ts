import { CurrencyValue } from './currency';

export interface MarketOrder {
  id: string;
  position: string;
  price: CurrencyValue;
  quantity: CurrencyValue;
  ours: boolean;
  maker: string;
}

export interface Market {
  buyOrders: MarketOrder[];
  sellOrders: MarketOrder[];
  highestBuyOrder?: MarketOrder;
  lowestSellOrder?: MarketOrder;
  isLoading?: boolean;
}
