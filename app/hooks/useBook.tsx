import { intoBook } from '../utils/book';
import useDaiBalance from './useDaiBalance';
import useEtherBalance from './useEtherBalance';
import useOrders from './useOrders';
import useBitcoinBalance from './useBitcoinBalance';

export default function useBook() {
  const orders = useOrders();
  const bitcoinBalance = useBitcoinBalance();
  const daiBalance = useDaiBalance();
  const etherBalance = useEtherBalance();

  return intoBook(bitcoinBalance, daiBalance, etherBalance, orders);
}
