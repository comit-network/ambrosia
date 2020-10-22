import useSWR from 'swr/esm/use-swr';
import { useCnd } from './useCnd';
import { Order } from '../utils/order';
import { AxiosResponse } from 'axios';
import { Action, Entity } from '../utils/cnd/siren';

export function intoOrders(response: AxiosResponse<Entity>): Order[] {
  return response.data.entities
    .map(order => {
      const { properties } = order;
      const actions = order.actions as Action[];
      const typedOrder: Order = {
        id: properties.id,
        position: properties.position,
        price: properties.price,
        quantity: properties.quantity,
        state: {
          open: {
            currency: properties.quantity.currency,
            decimals: properties.quantity.decimals,
            value: properties.state.open
          },
          closed: {
            currency: properties.quantity.currency,
            decimals: properties.quantity.decimals,
            value: properties.state.closed
          },
          settling: {
            currency: properties.quantity.currency,
            decimals: properties.quantity.decimals,
            value: properties.state.settling
          },
          failed: {
            currency: properties.quantity.currency,
            decimals: properties.quantity.decimals,
            value: properties.state.failed
          },
          cancelled: {
            currency: properties.quantity.currency,
            decimals: properties.quantity.decimals,
            value: properties.state.cancelled
          }
        },
        actions: actions
      };

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

export default function useOrders() {
  const cnd = useCnd();

  const { data: orders } = useSWR(
    '/orders',
    key => cnd.fetch(key).then(intoOrders),
    {
      refreshInterval: 1000,
      initialData: []
    }
  );

  return orders;
}
