import { Tag, TagLabel } from '@chakra-ui/core';
import { toBitcoin } from 'satoshi-bitcoin-ts';
import React from 'react';

interface Props {
  amount: string;
}

export default function BitcoinAmount({ amount }: Props) {
  return (
    <Tag variantColor="cyan" minWidth="9rem" marginRight="0.5rem">
      <TagLabel>{toBitcoin(amount)} BTC</TagLabel>
    </Tag>
  );
}
