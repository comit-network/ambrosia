import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flex,
  Stack,
  Button,
  Box,
  Text,
  Divider,
  Collapse
} from '@chakra-ui/core';
import routes from '../constants/routes.json';
import SwapProgress from './SwapProgress';

export default function SwapActions() {
  const [show, setShow] = useState(false);
  const handleToggle = () => setShow(!show);

  return (
    <div>
      <Text mb={2} fontSize="0.8em" color="gray.600">
        Swap Progress
      </Text>
      <Box bg="white" p={5} shadow="md">
        <Collapse startingHeight={80} isOpen={show}>
          <SwapProgress />
          TODO: Links to transactions and more details here.
        </Collapse>
        <Flex alignItems="center" justifyContent="center">
          <Button size="sm" onClick={handleToggle} mt={2}>
            View {show ? 'Less' : 'More'} Details
          </Button>
        </Flex>

        <Divider my={4} />

        <Stack isInline>
          <Link
            style={{ width: '100% ', marginRight: '1rem' }}
            to={routes.EXCHANGE}
          >
            <Button variantColor="teal" variant="outline" width="100%">
              Refund
            </Button>
          </Link>
          <Button leftIcon="check" variantColor="blue" shadow="sm" width="100%">
            Redeem
          </Button>
        </Stack>
      </Box>
    </div>
  );
}
