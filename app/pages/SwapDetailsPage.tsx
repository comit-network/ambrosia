import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from '@chakra-ui/core';
import routes from '../constants/routes.json';
import Maker from '../components/Maker';
import SwapDetails from '../components/SwapDetails';
import SwapActions from '../components/SwapActions';

export default function SwapDetailsPage() {
  const { id: swapId } = useParams();

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

      <Maker />

      <br />

      <SwapDetails />

      <br />

      <SwapActions />
    </Box>
  );
}
