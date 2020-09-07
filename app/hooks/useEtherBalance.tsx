import useSWR from 'swr/esm/use-swr';
import { ethIntoCurVal, ZERO_ETH } from '../utils/currency';
import { useLedgerEthereumWallet } from './useLedgerEthereumWallet';

export default function useEtherBalance() {
  const ethWallet = useLedgerEthereumWallet();
  const { data: balance } = useSWR(
    '/ether/balance',
    () => ethWallet.getEtherBalance().then(b => ethIntoCurVal(b)),
    {
      refreshInterval: 10000,
      errorRetryInterval: 500,
      errorRetryCount: 10,
      initialData: ZERO_ETH
    }
  );

  return balance;
}
