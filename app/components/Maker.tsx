import React from 'react';
import {
  Box,
  Heading,
  Text,
  Tooltip,
  Icon,
  Link as HTMLLink
} from '@chakra-ui/core';

export default function Maker() {
  return (
    <div>
      <Text mb={2} fontSize="0.8em" color="gray.600">
        Maker Details
      </Text>
      <Box bg="white" p={5} shadow="md">
        <Heading fontSize="1.8em">
          Maker Bob
          <Tooltip
            hasArrow
            aria-label="Maker reviewed by CoBlox"
            label="Maker reviewed by CoBlox"
            placement="top"
          >
            <Icon ml={2} fontSize="0.6em" opacity={0.6} name="view" />
          </Tooltip>
          <Tooltip
            hasArrow
            aria-label="User verified by Keybase"
            label="User verified by Keybase"
            placement="top"
          >
            <Icon ml={2} fontSize="0.6em" opacity={0.6} name="check-circle" />
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
    </div>
  );
}
