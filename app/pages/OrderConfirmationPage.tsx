import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Link as HTMLLink,
  Alert,
  AlertIcon
} from '@chakra-ui/core';
import routes from '../constants/routes.json';
import Maker from '../components/Maker';
import OrderDetails from '../components/OrderDetails';

export default function OrderConfirmationPage() {
  const { id: orderId } = useParams();

  return (
    <Box width="100%">
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={routes.EXCHANGE}>Exchange</Link>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="#">
            Order
            {orderId}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading fontSize="1.8em" mb={8}>
        Confirm your order
      </Heading>

      <Maker />

      <br />

      <OrderDetails />

      <Alert status="info" mt={2}>
        <AlertIcon />
        <Text>
          <strong>Next steps:</strong> After you submit your order, you and the
          maker will start a swap.{' '}
          <HTMLLink textDecoration="underline" color="cyan.800" href="#">
            Learn more.
          </HTMLLink>
        </Text>
      </Alert>
    </Box>
  );
}
