import React from 'react';
import { Stack } from '@chakra-ui/core';
import Swap from './Swap';
import { mockOngoingSwaps } from './MockData';

export default function SwapList() {
  const swapsResponse = mockOngoingSwaps();

  // TODO: Production code
  // let swapsEndpoint = "/swaps";
  // const { cnd } = useCnd();
  // const { data: swapsResponse } = useSWR<AxiosResponse<Entity>>(
  //     () => swapsEndpoint,
  //     () => cnd.fetch(swapsEndpoint),
  //     {
  //         refreshInterval: 1000,
  //         dedupingInterval: 0,
  //         compare: () => false
  //     }
  // );

  if (!swapsResponse) {
    return <Stack />;
  }

  const swaps = swapsResponse.data.entities;
  const listItems = swaps.map(swap => (
    <Swap key={swap.href} href={swap.href} />
  ));

  return <Stack width="100%">{listItems}</Stack>;
}
