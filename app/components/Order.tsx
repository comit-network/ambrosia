import React from 'react';
import PropTypes from 'prop-types';
import {
  PseudoBox,
  Badge,
  Flex,
  Icon,
  TagLabel,
  Box,
  Tag
} from '@chakra-ui/core';
import BitcoinAmount from './BitcoinAmount';
import DaiAmount from './DaiAmount';

const HoverFlex = ({ children }) => (
  <PseudoBox
    as={Flex}
    justifyContent="space-between"
    bg="white"
    p={3}
    mb={3}
    shadow="md"
    borderWidth="1px"
    borderRadius="8px"
    _hover={{ borderColor: 'blue.500', cursor: 'pointer' }}
  >
    {children}
  </PseudoBox>
);

const VARIANT_MAP = {
  new: 'cyan',
  pending: 'teal',
  failed: 'red',
  success: 'green'
};
function getVariant(status: string) {
  return VARIANT_MAP[status.toLowerCase()];
}

type OrderProperties = {
  bitcoin_absolute_expiry: number;
  bitcoin_amount: string;
  bitcoin_ledger: string;
  ethereum_absolute_expiry: number;
  ethereum_amount: string;
  ethereum_ledger: string;
  id: string;
  maker: string;
  position: string;
  token_contract: string;
};

type OrderProps = {
  status?: string;
  properties: OrderProperties;
};

function Order(props: OrderProps) {
  const { status, properties } = props;

  return (
    <HoverFlex>
      <Box d="flex" alignItems="baseline">
        <Box
          color="gray.500"
          fontWeight="semibold"
          letterSpacing="wide"
          fontSize="xs"
          textTransform="uppercase"
          mr={1}
          mt={2}
          width="10rem"
        >
          BTC &bull; DAI
          {status ? (
            <Badge
              ml={3}
              rounded="full"
              px="2"
              variantColor={getVariant(status)}
            >
              {status}
            </Badge>
          ) : null}
        </Box>
      </Box>

      <Box fontWeight="semibold">
        <Tag variantColor="gray" minWidth="3rem" margin="1rem">
          <TagLabel>{properties.position.toString()}</TagLabel>
        </Tag>
        <BitcoinAmount amount={properties.bitcoin_amount} />
        <Icon name="arrow-forward" mx={2} />
        <DaiAmount amount={properties.ethereum_amount} />
      </Box>
    </HoverFlex>
  );
}

export default Order;

HoverFlex.propTypes = {
  children: PropTypes.node.isRequired
};
