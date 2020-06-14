import React from 'react';
import { Link } from 'react-router-dom';
import { Stack, Button, Box, Text, Icon, Tag, TagLabel } from '@chakra-ui/core';
import routes from '../constants/routes.json';

export default function OrderDetails() {
  return (
    <div>
      <Text mb={2} fontSize="0.8em" color="gray.600">
        Order Details
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
          you will send <strong>100 DAI</strong> and receive{' '}
          <strong>0.01 BTC</strong>
        </Text>
        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="info" mr={2} />
          Rate: <strong>1 BTC = 9393.23 DAI</strong> (10% below market rate!)
        </Text>
        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="time" mr={2} />
          <strong>15 minutes</strong> untl this offer expires
        </Text>
        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="view" mr={2} />
          <strong>2</strong> takers
        </Text>

        <Stack mt={6} isInline>
          <Link
            style={{ width: '100% ', marginRight: '1rem' }}
            to={routes.EXCHANGE}
          >
            <Button variantColor="teal" variant="outline" width="100%">
              Cancel
            </Button>
          </Link>
          <Link style={{ width: '100% ' }} to="/swaps/1">
            <Button
              leftIcon="check"
              variantColor="blue"
              shadow="sm"
              width="100%"
            >
              Submit Order
            </Button>
          </Link>
        </Stack>
      </Box>
    </div>
  );
}
