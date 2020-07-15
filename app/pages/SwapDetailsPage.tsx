import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from '@chakra-ui/core';
import useSWR from 'swr';
import Store from 'electron-store';
import routes from '../constants/routes.json';
import SwapDetails from '../components/SwapDetails';
import SwapActions from '../components/SwapActions';

const settings = new Store();

export default function SwapDetailsPage() {
  const { id: swapId } = useParams();
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: swapResponse } = useSWR(
    `${settings.get('HTTP_URL_CND')}/swaps/${swapId}`,
    fetcher
  );
  const [swap, setSwap] = useState({});

  useEffect(() => {
    async function parseOrders() {
      if (swapResponse) {
        const parsedSwap = swapResponse.entities.map(r => {
          return { ...r.properties, rel: r.rel[0] };
        });
        const buySide = parsedSwap.filter(s => s.rel === 'alpha');
        const sellSide = parsedSwap.filter(s => s.rel === 'beta');

        // TODO: this GET swaps/:id endpoint is annoying to parse
        setSwap({
          buy_quantity: buySide[0] && buySide[0].quantity,
          buy_asset: buySide[0] && buySide[0].protocol,
          sell_quantity: sellSide[0] && sellSide[0].quantity,
          sell_asset: buySide[0] && sellSide[0].protocol
        });
      }
    }
    parseOrders();
  }, [swapResponse]);

  return (
    <Box width="100%">
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={routes.HISTORY}>History</Link>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="#">Swap {swapId}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading fontSize="1.8em" mb={8}>
        Your swap details
      </Heading>

      {/* TODO: there's no info about the maker in GET /swaps/:id */}
      {/* <Maker /> */}

      <br />

      <SwapDetails properties={swap} />

      <br />

      <SwapActions />
    </Box>
  );
}
