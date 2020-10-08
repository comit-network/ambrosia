import useSWR from 'swr/esm/use-swr';
import { ethIntoCurVal, ZERO_ETH } from '../utils/currency';
import { useLedgerEthereumWallet } from './useLedgerEthereumWallet';

export default function useEtherBalance() {
  const ethWallet = useLedgerEthereumWallet();
  const { data: balance, error: error } = useSWR(
    '/balance/eth',
    () => ethWallet.getEtherBalance(),
    {
      refreshInterval: 30000
    }
  );

  if (!balance || error !== undefined) {
    return {
      ...ZERO_ETH,
      isLoading: true
    };
  }

  return ethIntoCurVal(balance);
}
