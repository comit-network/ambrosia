import useSWR from 'swr/esm/use-swr';
import { daiIntoCurVal } from '../utils/currency';
import { useLedgerEthereumWallet } from './useLedgerEthereumWallet';
import { useCnd } from './useCnd';
import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';

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
    daiContractAddress ? '/balance/dai' : null,
    () => ethWallet.getErc20Balance(daiContractAddress),
    {
      refreshInterval: 10000,
      errorRetryInterval: 500,
      errorRetryCount: 10,
      initialData: BigNumber.from(0)
    }
  );

  return daiIntoCurVal(balance);
}
