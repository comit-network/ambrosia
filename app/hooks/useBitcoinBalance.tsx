import { useLedgerBitcoinWallet } from './useLedgerBitcoinWallet';
import useSWR from 'swr/esm/use-swr';
import { btcIntoCurVal } from '../utils/currency';
import { BigNumber } from 'ethers';

export default function useBitcoinBalance() {
  const btcWallet = useLedgerBitcoinWallet();
  const { data: balance } = useSWR(
    '/balance/btc',
    () => btcWallet.getBalance(),
    {
      refreshInterval: 10000,
      errorRetryInterval: 500,
      errorRetryCount: 10,
      initialData: BigNumber.from(0)
    }
  );

  return btcIntoCurVal(balance);
}
