import React, { useState, useEffect } from 'react';
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
import useSWR from 'swr';
import Store from 'electron-store';
import routes from '../constants/routes.json';
import Maker from '../components/Maker';
import OrderDetails from '../components/OrderDetails';
import SwapProgress from '../components/SwapProgress';

const settings = new Store();

export default function OrderConfirmationPage() {
  const { id: orderId } = useParams();

  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: takerOrdersResponse } = useSWR(
    `${settings.get('HTTP_URL_CND')}/orders`,
    fetcher
  );
  const [order, setOrder] = useState({});

  useEffect(() => {
    async function parseOrders() {
      if (takerOrdersResponse) {
        const parsedOrders = takerOrdersResponse.entities.map(r => {
          return r.properties;
        });
        const parsedOrder = parsedOrders.filter(o => o.id === orderId);
        setOrder(parsedOrder[0] || null); // TODO: handle order not found
      }
    }
    // TODO: API makes no sense here
    // We need to GET /orders because GET /orders/:id returns nothing
    parseOrders();
  }, [takerOrdersResponse]);

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

      <Maker id={order.maker} />

      <br />

      <OrderDetails details={order} />

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
