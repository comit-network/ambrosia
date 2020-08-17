import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/core';
import { AxiosResponse } from 'axios';
import useSWR from 'swr';
import { useEthereumWallet } from '../hooks/useEthereumWallet';
import { useBitcoinWallet } from '../hooks/useBitcoinWallet';
import executeLedgerAction from '../comit-sdk/action';
import { useCnd } from '../hooks/useCnd';
import { Entity } from '../comit-sdk/cnd/siren';

interface SwapProperties {
  href: string;
}

export default function Swap(props: SwapProperties) {
  const [executedActions, setExecutedActions] = useState([]);

  const { wallet: ETHWallet, loaded: ETHLoaded } = useEthereumWallet();
  const { wallet: BTCWallet, loaded: BTCLoaded } = useBitcoinWallet();
  const { cnd } = useCnd();

  const { data: swap } = useSWR<AxiosResponse<Entity>>(
    () => props.href,
    path => cnd.fetch(path),
    {
      refreshInterval: 1000,
      dedupingInterval: 0,
      compare: () => false
    }
  );

  useEffect(() => {
    console.log(swap);

    // Wallet guard
    if (!ETHLoaded || !BTCLoaded) {
      return;
    }
    // Action guard
    const swapHasExactlyOneAction =
      swap && swap.data.actions && swap.data.actions.length === 1;
    if (!swapHasExactlyOneAction) {
      return;
    }
    const action = swap.data.actions[0];
    // Don't trigger action twice guard
    if (executedActions.includes(action.href)) {
      return;
    }

    executeLedgerAction(action, cnd, {
      bitcoin: BTCWallet,
      ethereum: ETHWallet
    })
      .then(console.log)
      .catch(console.error);
    setExecutedActions([...executedActions, action.href]);
  }, [swap]);

  return <Box width="100%" />;
}
