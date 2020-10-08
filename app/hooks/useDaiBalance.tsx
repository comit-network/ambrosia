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
  const { data: balance, error: error } = useSWR(
    daiContractAddress ? '/balance/dai' : null,
    () => ethWallet.getErc20Balance(daiContractAddress),
    {
      refreshInterval: 30000
    }
  );

  if (!balance || error) {
    return {
      ...ZERO_DAI,
      isLoading: true
    };
  }

  return daiIntoCurVal(balance);
}
