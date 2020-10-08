import { useLedgerBitcoinWallet } from './useLedgerBitcoinWallet';
import useSWR from 'swr/esm/use-swr';
import { btcIntoCurVal, ZERO_BTC } from '../utils/currency';
import { useConfig } from '../config';

export default function useBitcoinBalance() {
  const [config] = useConfig();
  const btcWallet = useLedgerBitcoinWallet();
  const { data: balance, error: error } = useSWR(
    '/balance/btc',
    () => btcWallet.getBalance(),
    {
      refreshInterval: config.BITCOIN_BALANCE_POLL_INTERVAL_MS
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
