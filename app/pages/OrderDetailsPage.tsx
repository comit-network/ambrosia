import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Text } from '@chakra-ui/core';

export default function OrderDetailsPage() {
  const { id } = useParams();

  return (
    <Box width="100%">
      <Heading fontSize="1.8em" mb={8}>
        Order Details
      </Heading>
      <Text>
        This is the OrderDetails page for Order
        {id}
      </Text>
    </Box>
  );
}
