import { Action } from '../comit-sdk/cnd/siren';
import { CurrencyValue } from './currency';

export interface OrderState {
  open: CurrencyValue;
  closed: CurrencyValue;
  settling: CurrencyValue;
  failed: CurrencyValue;
  cancelled: CurrencyValue;
}

export interface Order {
  id: string;
  position: string;
  price: CurrencyValue;
  quantity: CurrencyValue;
  state: OrderState;
  actions: Action[];
}
