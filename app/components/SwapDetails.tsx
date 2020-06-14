import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flex,
  Stack,
  Button,
  Box,
  Text,
  Icon,
  Tag,
  TagLabel,
  Divider,
  Collapse
} from '@chakra-ui/core';
import routes from '../constants/routes.json';
import SwapProgress from './SwapProgress';

export default function SwapDetails() {
  const [show, setShow] = useState(false);
  const handleToggle = () => setShow(!show);

  return (
    <div>
      <Text mb={2} fontSize="0.8em" color="gray.600">
        Swap Details
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
          you are sending <strong>100 DAI</strong> to receive{' '}
          <strong>0.01 BTC</strong>
        </Text>
        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="info" mr={2} />
          Rate: <strong>1 BTC = 9393.23 DAI</strong> (10% below market rate!)
        </Text>
        <Text color="teal.800">
          <Icon mt="-4px" fontSize="0.8em" name="time" mr={2} />
          <strong>40 minutes</strong> untl this swap expires
        </Text>

        <Divider my={6} />

        <Collapse startingHeight={80} isOpen={show}>
          <SwapProgress />
          Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus
          terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer
          labore wes anderson cred nesciunt sapiente ea proident. Links to
          transactions and steps here.
        </Collapse>
        <Flex alignItems="center" justifyContent="center">
          <Button size="sm" onClick={handleToggle} mt={2}>
            View {show ? 'Less' : 'More'} Details
          </Button>
        </Flex>

        <Divider my={6} />

        <Stack mt={6} isInline>
          <Link
            style={{ width: '100% ', marginRight: '1rem' }}
            to={routes.EXCHANGE}
          >
            <Button variantColor="teal" variant="outline" width="100%">
              Refund
            </Button>
          </Link>
          <Button leftIcon="check" variantColor="blue" shadow="sm" width="100%">
            Redeem
          </Button>
        </Stack>
      </Box>
    </div>
  );
}
