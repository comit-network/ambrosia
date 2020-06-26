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
  AlertIcon,
  Divider,
  Stack,
  Button
} from '@chakra-ui/core';
import routes from '../constants/routes.json';
import Maker from '../components/Maker';
import OrderDetails from '../components/OrderDetails';
import SwapProgress from '../components/SwapProgress';

export default function OrderConfirmationPage() {
  const { id: orderId } = useParams();

  return (
    <Box width="100%">
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={routes.EXCHANGE}>Exchange</Link>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="#">{`Order ${orderId}`}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading fontSize="1.8em" mb={8}>
        Confirm your order
      </Heading>

      <Maker />

      <br />

      <OrderDetails />

      <br />

      <Text mb={2} fontSize="0.8em" color="gray.600">
        Swap Progress
      </Text>
      <Box bg="white" p={5} shadow="md">
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Text>
            <strong>Next steps:</strong> After you submit your order, you and
            the maker will start a swap.{' '}
            <HTMLLink textDecoration="underline" color="cyan.800" href="#">
              Learn more.
            </HTMLLink>
          </Text>
        </Alert>

        <SwapProgress />

        <Divider my={4} />

        <Stack mt={6} isInline>
          <Link
            style={{ width: '100% ', marginRight: '1rem' }}
            to={routes.EXCHANGE}
          >
            <Button variantColor="teal" variant="outline" width="100%">
              Back to Orders
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
    </Box>
  );
}
