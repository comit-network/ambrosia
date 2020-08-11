import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  AlertIcon,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Divider,
  Heading,
  Link as HTMLLink,
  Stack,
  Text
} from '@chakra-ui/core';
import axios, { AxiosResponse } from 'axios';
import useSWR from 'swr';
import Store from 'electron-store';
import routes from '../constants/routes.json';
import Maker from '../components/Maker';
import OrderDetails from '../components/OrderDetails';
import SwapProgress from '../components/SwapProgress';
import { useEthereumWallet } from '../hooks/useEthereumWallet';
import { useBitcoinWallet } from '../hooks/useBitcoinWallet';
import executeLedgerAction from '../comit-sdk/action';
import { useCnd } from '../hooks/useCnd';
import { Entity } from '../comit-sdk/cnd/siren';

const settings = new Store();

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState(null);
  const [swapHref, setSwap] = useState(null);
  const [executedActions, setExecutedActions] = useState([]);

  const { id: orderId } = useParams();
  const { wallet: ETHWallet, loaded: ETHLoaded } = useEthereumWallet();
  const { wallet: BTCWallet, loaded: BTCLoaded } = useBitcoinWallet();

  const { cnd } = useCnd();

  const { data: takerOrdersResponse } = useSWR<AxiosResponse<Entity>>(
    '/orders',
    path => cnd.fetch(path)
  );

  const { data: swap } = useSWR<AxiosResponse<Entity>>(
    () => swapHref,
    path => cnd.fetch(path),
    {
      refreshInterval: 1000,
      dedupingInterval: 0,
      compare: () => false
    }
  );

  async function takeOrder() {
    if (BTCLoaded && ETHLoaded) {
      const ethAddress = ETHWallet.getAccount();
      const btcAddress = await BTCWallet.getAddress();
      // TODO: refund identity should be the chain you are sending
      // TODO: redeem identity should be the chain you are receiving
      // Below assumes user is taking a BTC -> DAI offer
      const res = await axios.post(
        `${settings.get('HTTP_URL_CND')}/orders/${orderId}/take`,
        {
          bitcoin_identity: btcAddress, // BTC wallet address
          ethereum_identity: ethAddress // ETH wallet address
        }
      );

      console.log(res);

      // get headers from response after taking
      setSwap(res.headers.location); // e.g. /swaps/f5739e5b-0a9a-41b7-9512-60aeceb15624
    }
  }

  useEffect(() => {
    async function parseOrders() {
      if (takerOrdersResponse) {
        const parsedOrders = takerOrdersResponse.data.entities.map(r => {
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

  useEffect(() => {
    console.log(swap);
    const swapHasExactlyOneAction =
      swap && swap.data.actions && swap.data.actions.length === 1;
    if (!swapHasExactlyOneAction) {
      return;
    }
    const action = swap.data.actions[0];
    if (executedActions.includes(action.href)) {
      return;
    }
    executeLedgerAction(action, cnd, {
      bitcoin: BTCWallet,
      ethereum: ETHWallet
    })
      .then(console.log)
      .catch(console.error);
    setExecutedActions([...executedActions, action.href]);
  }, [swap]);

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

      {order && (
        <>
          <Maker id={order.maker} />
          <br />
          <OrderDetails details={order} />
        </>
      )}
      <br />

      <Text mb={2} fontSize="0.8em" color="gray.600">
        Swap Progress
      </Text>
      <Box bg="white" p={5} shadow="md">
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Text>
            <strong>Next steps:</strong> After you take the order, you and the
            maker will start a swap.{' '}
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
          <Button
            leftIcon="check"
            variantColor="blue"
            shadow="sm"
            width="100%"
            onClick={takeOrder}
          >
            Take Order
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
