import useSWR from 'swr/esm/use-swr';
import { daiIntoCurVal, ZERO_DAI } from '../utils/currency';
import { useLedgerEthereumWallet } from './useLedgerEthereumWallet';
import { useCnd } from './useCnd';
import { useEffect, useState } from 'react';

export default function useDaiBalance() {
  const cnd = useCnd();
  const [daiContractAddress, setDaiContractAddress] = useState(null);

  useEffect(() => {
    async function loadDaiContractAddress() {
      try {
        const contract = await cnd.daiContractAddress();
        setDaiContractAddress(contract);
      } catch (e) {
        console.error(e);
      }
    }

    if (!daiContractAddress) loadDaiContractAddress();
  }, [cnd]);

  const ethWallet = useLedgerEthereumWallet();
  const { data: balance } = useSWR(
    daiContractAddress ? '/dai/balance' : null,
    () =>
      ethWallet.getErc20Balance(daiContractAddress).then(b => daiIntoCurVal(b)),
    {
      refreshInterval: 10000,
      errorRetryInterval: 500,
      errorRetryCount: 10,
      initialData: ZERO_DAI
    }
  );

  return balance;
}
