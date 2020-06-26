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

const HoverFlex = ({ children }) => {
  return (
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
};

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
  absolute_expiry: number;
  buy_quantity: string;
  id: string;
  maker: string;
  sell_quantity: string;
};

type OrderProps = {
  status?: string;
  properties: OrderProperties; // TODO: type out ORder
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
          mr={2}
          mt={2}
          width="10rem"
        >
          DAI &bull; BTC
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
        <Tag variantColor="cyan" minWidth="8rem">
          <TagLabel>{properties.buy_quantity}</TagLabel>
        </Tag>
        <Icon name="arrow-forward" mx={2} />
        <Tag variantColor="orange" minWidth="8rem">
          {/* TODO: get token symbol for properties.sell_token_contract */}
          <TagLabel>{properties.sell_quantity} DAI</TagLabel>
        </Tag>
      </Box>
      <Box mt={1} as="span" color="gray.600" fontSize="sm">
        Expires in {properties.absolute_expiry / 60} mins
      </Box>
    </HoverFlex>
  );
}

export default Order;

HoverFlex.propTypes = {
  children: PropTypes.node.isRequired
};
