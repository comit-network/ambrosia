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

type OrderProps = {
  status: string;
};

const HoverFlex = ({ children }) => {
  return (
    <PseudoBox
      as={Flex}
      justifyContent="space-between"
      bg="white"
      p={4}
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

function Order(props: OrderProps) {
  const { status, onClick } = props;

  return (
    <HoverFlex onClick={onClick}>
      <Box d="flex" alignItems="baseline">
        <Box
          color="gray.500"
          fontWeight="semibold"
          letterSpacing="wide"
          fontSize="xs"
          textTransform="uppercase"
          mr="2"
          mt="2"
          width="10rem"
        >
          DAI &bull; BTC
          <Badge ml={3} rounded="full" px="2" variantColor={getVariant(status)}>
            {status}
          </Badge>
        </Box>
      </Box>

      <Box fontWeight="semibold" isTruncated>
        <Tag variantColor="cyan" minWidth="8rem">
          <TagLabel>100 DAI</TagLabel>
        </Tag>
        <Icon name="arrow-forward" />
        <Tag variantColor="orange" minWidth="8rem">
          <TagLabel>1.2 BTC</TagLabel>
        </Tag>
      </Box>
      <Box mt={1} as="span" color="gray.600" fontSize="sm">
        Rate: 1 BTC = 18274 DAI
      </Box>
    </HoverFlex>
  );
}

export default Order;

HoverFlex.propTypes = {
  children: PropTypes.node.isRequired
};
