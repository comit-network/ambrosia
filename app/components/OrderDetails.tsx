import React from 'react';
import { Box, Text, Icon, TagLabel, Tag, Stack } from '@chakra-ui/core';
import BitcoinAmount from './BitcoinAmount';
import DaiAmount from './DaiAmount';

type OrderDetailsProps = {
  details: OrderDetails;
};

type OrderDetails = {
  bitcoin_amount: string;
  ethereum_amount: string;
  position: string;
};

export default function OrderDetails(props: OrderDetailsProps) {
  const { details } = props;

  return (
    <Box>
      <Text mb={2} fontSize="0.8em" color="gray.600">
        Order Details
      </Text>
      <Box bg="white" p={5} shadow="md">
        <Box fontSize="1.2em" mb={4} width="100%" fontWeight="semibold">
          <Text> BTC / DAI </Text>
          <Tag variantColor="gray" minWidth="3rem" margin="1rem">
            <TagLabel>{details.position.toString()}</TagLabel>
          </Tag>
          <BitcoinAmount amount={details.bitcoin_amount} />
          <Icon name="arrow-forward" width="10%" />
          <DaiAmount amount={details.ethereum_amount} />
        </Box>

        {details.position === 'sell' ? (
          <Stack isInline color="teal.800" width="100%">
            <Text>
              <Icon mt="-4px" fontSize="0.8em" name="repeat" mr={2} />
              taking a sell order means you send{' '}
            </Text>
            <DaiAmount amount={details.ethereum_amount} />
            <Text> and receive </Text>
            <BitcoinAmount amount={details.bitcoin_amount} />
          </Stack>
        ) : (
          <Stack isInline color="teal.800" width="100%">
            <Text color="teal.800">
              <Icon mt="-4px" fontSize="0.8em" name="repeat" mr={2} />
              taking a buy order means you send
            </Text>
            <BitcoinAmount amount={details.bitcoin_amount} />
            <Text> and receive </Text>
            <DaiAmount amount={details.ethereum_amount} />
          </Stack>
        )}
      </Box>
    </Box>
  );
}
