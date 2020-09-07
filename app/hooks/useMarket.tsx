import useSWR from 'swr/esm/use-swr';
import { useCnd } from './useCnd';
import { intoMarket } from '../utils/market';

export default function useMarket() {
  const cnd = useCnd();

  const { data: marketResponse } = useSWR(
    '/markets/BTC-DAI',
    key => cnd.fetch(key),
    {
      refreshInterval: 1000
    }
  );

  return intoMarket(marketResponse);
}
