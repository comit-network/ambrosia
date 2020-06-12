import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from '@chakra-ui/core';
import routes from '../constants/routes.json';

export default function OrderConfirmationPage() {
  const { id: orderId } = useParams();

  return (
    <Box width="100%">
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={routes.EXCHANGE}>
            <BreadcrumbLink>Exchange</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="#">Order [id]</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading fontSize="1.8em" mb={8}>
        Confirm your order
      </Heading>
      <Text>
        This is the details for Order
        {orderId}
        {/* - details about the maker - details about addresses - details
        about asset tokens and amounts - details about rates - details about
        expiry - maybe multi-step progress bar that shows next steps */}
      </Text>

      <Button variantColor="green">Submit Order</Button>
    </Box>
  );
}
