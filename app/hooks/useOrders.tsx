import useSWR from 'swr/esm/use-swr';
import { useCnd } from './useCnd';
import { intoOrders } from '../utils/order';

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
