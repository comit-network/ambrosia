import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Tooltip,
  Icon,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Link as HTMLLink,
  Tag,
  TagLabel,
  Alert,
  AlertIcon
} from '@chakra-ui/core';
import routes from '../constants/routes.json';

export default function OrderConfirmationPage() {
  const { id: orderId } = useParams();

  return (
    <Box width="100%">
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={routes.EXCHANGE}>Exchange</Link>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="#">
            Order
            {orderId}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading fontSize="1.8em" mb={8}>
        Confirm your order
      </Heading>

      <Text mb={2} fontSize="0.8em" color="gray.600">
        Maker Details
      </Text>
      <Box bg="white" p={5} shadow="md">
        <Heading fontSize="1.8em">
          Maker Bob
          <Tooltip hasArrow label="Maker reviewed by CoBlox" placement="top">
            <Icon ml={2} fontSize="0.6em" opacity="0.6" name="view" />
          </Tooltip>
          <Tooltip hasArrow label="User verified by Keybase" placement="top">
            <Icon ml={2} fontSize="0.6em" opacity="0.6" name="check-circle" />
          </Tooltip>
        </Heading>
        <Text>
          Nodes you can trust. The leading maker in the COMIT network.
        </Text>
        <HTMLLink color="teal.500" href="https://comit.network" isExternal>
          <Icon mt="-4px" fontSize="0.7em" name="link" mr={1} />
          https://mywebsite.io
        </HTMLLink>
      </Box>

      <br />

      <Text mb={2} fontSize="0.8em" color="gray.600">
        Order Details
      </Text>
      <Box bg="white" p={5} shadow="md">
        <Box fontSize="1.2em" mb={4} width="100%" fontWeight="semibold">
          <Tag p={3} variantColor="cyan" width="45%">
            <TagLabel>100 DAI</TagLabel>
          </Tag>
          <Icon name="arrow-forward" width="10%" />
          <Tag p={3} variantColor="orange" width="45%">
            <TagLabel>0.01 BTC</TagLabel>
          </Tag>
        </Box>

        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="repeat" mr={2} />
          you will send <strong>100 DAI</strong> and receive{' '}
          <strong>0.01 BTC</strong>
        </Text>
        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="info" mr={2} />
          Rate: <strong>1 BTC = 9393.23 DAI</strong> (10% below market rate!)
        </Text>
        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="time" mr={2} />
          <strong>15 minutes</strong> untl this offer expires
        </Text>
        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="view" mr={2} />
          <strong>2</strong> takers
        </Text>
      </Box>

      <Alert status="info" mt={2}>
        <AlertIcon />
        <Text>
          <strong>Next steps:</strong> After you submit your order, you and the
          maker will start a swap.{' '}
          <HTMLLink textDecoration="underline" color="cyan.800" href="#">
            Learn more.
          </HTMLLink>
        </Text>
      </Alert>

      <Link to="/swaps/1">
        <Button
          leftIcon="check"
          mt={8}
          variantColor="blue"
          float="right"
          shadow="sm"
        >
          Submit Order
        </Button>
      </Link>
      <Link to={routes.EXCHANGE}>
        <Button
          mt={8}
          mr={4}
          variantColor="teal"
          float="right"
          variant="outline"
        >
          Cancel
        </Button>
      </Link>
    </Box>
  );
}
