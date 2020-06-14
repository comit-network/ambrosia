import React from 'react';
import { Box, Text } from '@chakra-ui/core';

export default function SwapProgress() {
  return (
    <Box my={2}>
      <ul className="list-unstyled multi-steps">
        <li>Maker Accepted</li>
        <li>You Funded</li>
        <li className="is-active">Maker Funded</li>
        <li>You Redeemed</li>
        <li>Maker Redeemed</li>
      </ul>
    </Box>
  );
}
