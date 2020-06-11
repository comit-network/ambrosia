import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Text, Button } from '@chakra-ui/core';

export default function OrderConfirmationPage() {
  const { id: orderId } = useParams();

  return (
    <Box width="100%">
      <Heading fontSize="1.8em" mb={8}>
        Continue with this Order?
      </Heading>
      <Text>
        This is the details for Order
        {orderId}
      </Text>

      <Button variantColor="green">Submit</Button>
    </Box>
  );
}
