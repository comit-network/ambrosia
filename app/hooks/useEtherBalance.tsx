import useSWR from 'swr/esm/use-swr';
import { ethIntoCurVal, ZERO_ETH } from '../utils/currency';
import { useLedgerEthereumWallet } from './useLedgerEthereumWallet';
import { useConfig } from '../config';

export default function useEtherBalance() {
  const [config] = useConfig();
  const ethWallet = useLedgerEthereumWallet();
  const { data: balance, error: error } = useSWR(
    '/balance/eth',
    () => ethWallet.getEtherBalance(),
    {
      refreshInterval: config.ETHEREUM_BALANCE_POLL_INTERVAL_MS
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
