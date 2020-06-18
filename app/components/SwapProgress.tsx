import React from 'react';
import { Box } from '@chakra-ui/core';

export default function SwapProgress(props) {
  const { started } = props;

  return (
    <Box my={2}>
      <ul className="list-unstyled multi-steps">
        <li className={!started ? 'is-active' : ''}>Start</li>
        <li>Maker Accepted</li>
        <li>You Funded</li>
        <li className={started ? 'is-active' : ''}>Maker Funded</li>
        <li>You Redeemed</li>
        <li>Maker Redeemed</li>
      </ul>
    </Box>
  );
}
