import React from 'react';
import {Flex, Stack, Text} from '@chakra-ui/core';
import SwapRow from './SwapRow';
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
    <SwapRow key={swap.href} href={swap.href} />
  ));

  const header = (
      <Text textShadow="md" fontSize="lg">
        Ongoing Swaps
      </Text>
  );

  if (!listItems || listItems.length === 0) {
    return (
        <Flex justifyItems="center" alignItems="center" shadow="md">
          {header}
          <Text>Currently no swaps...</Text>
        </Flex>
    );
  }

  return (
      <Flex direction="column" backgroundColor="white" shadow="md" paddingRight="1rem" paddingLeft="1rem" paddingBottom="1rem" paddingTop="0.5rem">
        {header}
        <Stack width="100%">
          {listItems}
        </Stack>
      </Flex>
  );
}
