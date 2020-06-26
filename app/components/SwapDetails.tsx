import React from 'react';
import { Box, Text, Icon, Tag, TagLabel } from '@chakra-ui/core';

type SwapDetailsProps = {
  properties: object;
};

// TODO: Hack, GET /swaps response should format decimals like GET /orders ?
function insertDecimals(num, dec) {
  return (num / 10 ** dec).toFixed(dec);
}

// TODO: Hack, asset name should be returned by GET /swaps ?
function getAssetName(n) {
  if (n === 'hbit') return 'BTC';
  return 'DAI';
}

export default function SwapDetails(props: SwapDetailsProps) {
  const { properties } = props;

  return (
    <div>
      <Text mb={2} fontSize="0.8em" color="gray.600">
        Swap Details
      </Text>
      <Box bg="white" p={5} shadow="md">
        <Box fontSize="1.2em" mb={4} width="100%" fontWeight="semibold">
          <Tag p={3} variantColor="cyan" width="45%">
            <TagLabel>
              {/* TODO: hack to remove trailing zeros */}
              {parseFloat(insertDecimals(properties.buy_quantity, 8))}{' '}
              {getAssetName(properties.buy_asset)}
            </TagLabel>
          </Tag>
          <Icon name="arrow-forward" width="10%" />
          <Tag p={3} variantColor="orange" width="45%">
            <TagLabel>
              {properties.sell_quantity} {getAssetName(properties.sell_asset)}
            </TagLabel>
          </Tag>
        </Box>

        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="repeat" mr={2} />
          you are sending{' '}
          <strong>
            {properties.sell_quantity} {getAssetName(properties.sell_asset)}
          </strong>{' '}
          to receive{' '}
          <strong>
            {insertDecimals(properties.buy_quantity, 8)}{' '}
            {getAssetName(properties.buy_asset)}
          </strong>
        </Text>
        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="time" mr={2} />
          <strong>40 minutes</strong> untl this swap expires
        </Text>
      </Box>
    </div>
  );
}
