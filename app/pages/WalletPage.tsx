import React from 'react';
import {Flex, Heading} from '@chakra-ui/core';
import BalanceHorizontal from '../components/BalanceHorizontal';

export default function WalletPage() {
  return (
    <Flex direction="column" width="100%" padding="1rem">
      <Flex
        direction="row"
        width="100%"
        minHeight="100px"
        maxHeight="400px"
        marginBottom="1rem"
      >
        <BalanceHorizontal />
      </Flex>

      <Flex
        background="white"
        shadow="md"
        direction="row"
        width="100%"
      >
        <Heading fontSize="1.0em" mb={8}>
          List of trades, should show what "goes in and out of the wallet"
        </Heading>
      </Flex>
    </Flex>
  );
}
