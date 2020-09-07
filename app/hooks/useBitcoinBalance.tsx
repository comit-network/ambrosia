import { useLedgerBitcoinWallet } from './useLedgerBitcoinWallet';
import useSWR from 'swr/esm/use-swr';
import { btcIntoCurVal, ZERO_BTC } from '../utils/currency';

export default function useBitcoinBalance() {
  const btcWallet = useLedgerBitcoinWallet();
  const { data: balance } = useSWR(
    '/bitcoin/balance',
    () => btcWallet.getBalance().then(b => btcIntoCurVal(b)),
    {
      refreshInterval: 10000,
      errorRetryInterval: 500,
      errorRetryCount: 10,
      initialData: ZERO_BTC
    }
  );

  return balance;
}
