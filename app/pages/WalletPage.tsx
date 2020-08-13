import React from 'react';
import { Heading, Box } from '@chakra-ui/core';

export default function WalletPage() {
  return (
    <Box width="100%">
      <Heading fontSize="1.8em" mb={8}>
        Detailed wallet page; should show the balance as in total, available and
        locked inorders, as well as a total balance in e.g. BTC or USD, can also
        show how the assets changed over time
      </Heading>
    </Box>
  );
}
