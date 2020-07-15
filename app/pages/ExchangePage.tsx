import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Text, Tooltip, Icon, Box, Heading } from '@chakra-ui/core';
import useSWR from 'swr';
import Store from 'electron-store';
import Order from '../components/Order';
import MarketData from '../components/MarketData';

const settings = new Store();

export default function ExchangePage() {
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: takerOrdersResponse } = useSWR(
    `${settings.get('HTTP_URL_CND')}/orders`,
    fetcher
  );
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function parseOrders() {
      if (takerOrdersResponse) {
        const parsedOrders = takerOrdersResponse.entities.map(r => {
          return r.properties;
        });
        setOrders(parsedOrders);
      }
    }
    parseOrders();
  }, [takerOrdersResponse]);

  return (
    <Box width="100%">
      <Heading fontSize="1.8em" mb={8}>
        Exchange
      </Heading>

      <MarketData />

      <br />

      <Heading fontSize="1.4em" mt={8} mb={4}>
        Available Orders
        <Tooltip
          hasArrow
          aria-label="You can pick and choose any order below to proceed with a swap."
          label="You can pick and choose any order below to proceed with a swap."
          placement="right"
        >
          <Icon ml={2} opacity={0.2} name="question" />
        </Tooltip>
      </Heading>

      {orders && orders.length > 0 ? (
        orders.map(o => (
          <Link key={o.id} to={`/orders/${o.id}`}>
            <Order status="New" properties={o} />
          </Link>
        ))
      ) : (
        <Text>You have no orders.</Text>
      )}
    </Box>
  );
}
