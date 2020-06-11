import React from 'react';
import { Heading, Box } from '@chakra-ui/core';
import Order from '../components/Order';

export default function HistoryPage() {
  return (
    <Box width="100%">
      <Heading fontSize="1.8em" mb={8}>
        Order History
      </Heading>

      <Order status="Pending" />
      <Order status="Failed" />
      <Order status="Success" />
    </Box>
  );
}
