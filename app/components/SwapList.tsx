import React from 'react';
import { Flex, Stack, Text } from '@chakra-ui/core';
import SwapRow from './SwapRow';
import { useCnd } from '../hooks/useCnd';
import useSWR from 'swr/esm/use-swr';
import { AxiosResponse } from 'axios';
import { Entity } from '../comit-sdk/cnd/siren';

export default function SwapList() {
  const cnd = useCnd();
  const { data: swapsResponse } = useSWR<AxiosResponse<Entity>>(
      "/swaps",
      (key) => cnd.fetch(key),
      {
          refreshInterval: 1000,
      }
  );

  if (!swapsResponse) {
    return <Stack />;
  }

  const listItems = swapsResponse.data.entities.map(swap => (
    <SwapRow key={swap.href} href={swap.href} />
  ));

  if (!listItems || listItems.length === 0) {
    return (
        <Flex direction="column"
              paddingRight="1rem"
              paddingLeft="1rem"
              paddingBottom="1rem"
              paddingTop="0.5rem"
        >
          <Text color="gray.400">Currently no swaps, once an order matches swaps will appear here.</Text>
        </Flex>
    );
  }

  return (
      <Flex direction="column"
            paddingRight="1rem"
            paddingLeft="1rem"
            paddingBottom="1rem"
      >
        <Stack width="100%">
          {listItems}
        </Stack>
      </Flex>
  );
}
