import useSWR from 'swr/esm/use-swr';
import { ethIntoCurVal } from '../utils/currency';
import { useLedgerEthereumWallet } from './useLedgerEthereumWallet';
import { BigNumber } from 'ethers';

export default function useEtherBalance() {
  const ethWallet = useLedgerEthereumWallet();
  const { data: balance } = useSWR(
    '/balance/eth',
    () => ethWallet.getEtherBalance(),
    {
      refreshInterval: 10000,
      errorRetryInterval: 500,
      errorRetryCount: 10,
      initialData: BigNumber.from(0)
    }
  );

  return ethIntoCurVal(balance);
}
