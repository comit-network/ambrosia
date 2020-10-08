import { useLedgerBitcoinWallet } from './useLedgerBitcoinWallet';
import useSWR from 'swr/esm/use-swr';
import { btcIntoCurVal, ZERO_BTC } from '../utils/currency';

export default function useBitcoinBalance() {
  const btcWallet = useLedgerBitcoinWallet();
  const { data: balance, error: error } = useSWR(
    '/balance/btc',
    () => btcWallet.getBalance(),
    {
      refreshInterval: 30000
    }
  );

  if (!balance || error) {
    console.error(error);
    return {
      ...ZERO_BTC,
      isLoading: true
    };
  }

  return btcIntoCurVal(balance);
}
