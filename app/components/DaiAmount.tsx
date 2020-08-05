import { Tag, TagLabel } from '@chakra-ui/core';
import React from 'react';
import { formatUnits } from 'ethers/lib/utils';

interface Props {
  amount: string;
}

export default function DaiAmount({ amount }: Props) {
  const formattedAmount = formatUnits(amount);
  const trimmedAmount = formattedAmount.substring(
    0,
    formattedAmount.indexOf('.') + 8
  );

  return (
    <Tag variantColor="orange" minWidth="9rem" marginRight="0.5rem">
      <TagLabel>{trimmedAmount} DAI</TagLabel>
    </Tag>
  );
}
