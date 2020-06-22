import React from 'react';
import { Box, Image, Flex, Heading, Button, Text } from '@chakra-ui/core';
import { Link } from 'react-router-dom';
import Balances from '../components/Balances';
import browseImage from '../assets/browse.svg';
import routes from '../constants/routes.json';

export default function DashboardPage() {
  return (
    <Box width="100%">
      <Heading fontSize="1.8em" mb={8}>
        Dashboard
      </Heading>

      <Heading fontSize="1.4em" mt={8} mb={4}>
        My Wallet
      </Heading>
      <Balances />

      <Box mt={58}>
        <Heading fontSize="1.4em" mt={8} mb={4}>
          Active Orders
        </Heading>
        <Flex justifyContent="center" alignItems="center">
          <Image src={browseImage} size="12rem" />
        </Flex>
        <Text textAlign="center" fontWeight="600">
          Choose an order to get started
        </Text>
        <Text textAlign="center">
          Choose an order to start trading across chains. You must have
          sufficient balance in your wallets to trade.
        </Text>

        <Flex mt={8} justifyContent="center" alignItems="center">
          <Link to={routes.EXCHANGE}>
            <Button leftIcon="search" variantColor="blue" alignSelf="center">
              Browse Orders
            </Button>
          </Link>
        </Flex>
      </Box>
    </Box>
  );
}
