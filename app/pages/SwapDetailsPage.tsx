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

export default function SwapDetailsPage() {
  const { id: swapId } = useParams();

  return (
    <Box width="100%">
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={routes.HISTORY}>
            <BreadcrumbLink>History</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="#">Order [id]</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading fontSize="1.8em" mb={8}>
        Your order details
      </Heading>
      <Text>
        This is the details for Swap
        {swapId}
      </Text>
    </Box>
  );
}
