import React from 'react';
import { Box, Text, Icon, Tag, TagLabel } from '@chakra-ui/core';

export default function SwapDetails() {
  return (
    <div>
      <Text mb={2} fontSize="0.8em" color="gray.600">
        Swap Details
      </Text>
      <Box bg="white" p={5} shadow="md">
        <Box fontSize="1.2em" mb={4} width="100%" fontWeight="semibold">
          <Tag p={3} variantColor="cyan" width="45%">
            <TagLabel>100 DAI</TagLabel>
          </Tag>
          <Icon name="arrow-forward" width="10%" />
          <Tag p={3} variantColor="orange" width="45%">
            <TagLabel>0.01 BTC</TagLabel>
          </Tag>
        </Box>

        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="repeat" mr={2} />
          you are sending <strong>100 DAI</strong> to receive{' '}
          <strong>0.01 BTC</strong>
        </Text>
        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="info" mr={2} />
          Rate: <strong>1 BTC = 9393.23 DAI</strong> (10% below market rate!)
        </Text>
        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="time" mr={2} />
          <strong>40 minutes</strong> untl this swap expires
        </Text>
      </Box>
    </div>
  );
}
