import React from 'react';
import { Box, Text, Icon, Tag, TagLabel } from '@chakra-ui/core';

type OrderDetailsProps = {
  details: OrderDetails;
};

type OrderDetails = {
  absolute_expiry: number;
  buy_quantity: string;
  sell_quantity: string;
};

export default function OrderDetails(props: OrderDetailsProps) {
  const { details } = props;

  return (
    <div>
      <Text mb={2} fontSize="0.8em" color="gray.600">
        Order Details
      </Text>
      <Box bg="white" p={5} shadow="md">
        <Box fontSize="1.2em" mb={4} width="100%" fontWeight="semibold">
          <Tag p={3} variantColor="cyan" width="45%">
            {/* TODO: hack to remove trailing zeros */}
            <TagLabel>
              {parseFloat(details.buy_quantity).toString()} BTC
            </TagLabel>
          </Tag>
          <Icon name="arrow-forward" width="10%" />
          <Tag p={3} variantColor="orange" width="45%">
            {/* TODO: get token symbol for order.sell_token_contract */}
            <TagLabel>{details.sell_quantity} DAI</TagLabel>
          </Tag>
        </Box>

        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="repeat" mr={2} />
          you will send <strong>{details.buy_quantity}</strong> and receive{' '}
          <strong>{details.sell_quantity} DAI</strong>
        </Text>
        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="time" mr={2} />
          <strong>{details.absolute_expiry / 60} mins</strong> until this offer
          expires
        </Text>
      </Box>
    </div>
  );
}
