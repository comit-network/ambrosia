import { CurrencyValue } from './currency';

export interface Book {
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
