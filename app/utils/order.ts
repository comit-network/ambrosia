import { Action } from '../comit-sdk/cnd/siren';
import { CurrencyValue } from './currency';

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
