import React, { useState } from 'react';
import {
  Flex,
  Button,
  Stack,
  Heading,
  Text,
  Switch,
  Box,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Select,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/core';
import Store from 'electron-store';

const settings = new Store();

export default function SettingsPage() {
  const BITCOIN_HD_KEY = settings.get('BITCOIN_HD_KEY');
  const BITCOIN_P2P_URI = settings.get('BITCOIN_P2P_URI');
  const ETHEREUM_KEY = settings.get('ETHEREUM_KEY');
  const ETHEREUM_NODE_HTTP_URL = settings.get('ETHEREUM_NODE_HTTP_URL');
  const ERC20_CONTRACT_ADDRESS = settings.get('ERC20_CONTRACT_ADDRESS');
  const HTTP_URL_CND = settings.get('HTTP_URL_CND');

  return (
    <Box width="100%">
      <Heading fontSize="1.8em" mb={8}>
        Settings
      </Heading>

      <Tabs variant="soft-rounded" variantColor="cyan">
        <TabList mb={4}>
          <Tab>General</Tab>
          <Tab>Debug</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box bg="white" p={5} shadow="md" borderWidth="1px">
              <Flex justifyContent="space-between">
                <Text mt={2} fontWeight="600">
                  Primary currency
                </Text>

                <Select width="100px" placeholder="Select option">
                  <option selected value="option1">
                    USD
                  </option>
                  <option value="option2">AUD</option>
                  <option value="option3">SGD</option>
                </Select>
              </Flex>

              <Divider my={4} />

              <Flex justifyContent="space-between">
                <Text fontWeight="600">Password lock</Text>
                <Switch size="lg" />
              </Flex>
            </Box>
          </TabPanel>
          <TabPanel>
            <Box bg="white" p={5} shadow="md" borderWidth="1px">
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>BITCOIN_HD_KEY</FormLabel>
                  <Flex mb={2}>
                    <Input value={BITCOIN_HD_KEY} />
                    <Button onClick={console.log} ml={2}>
                      Set
                    </Button>
                  </Flex>
                </FormControl>

                <FormControl>
                  <FormLabel>BITCOIN_P2P_URI</FormLabel>
                  <Input value={BITCOIN_P2P_URI} isReadOnly />
                </FormControl>

                <FormControl>
                  <FormLabel>ETHEREUM_KEY</FormLabel>
                  <Input value={ETHEREUM_KEY} isReadOnly />
                </FormControl>

                <FormControl>
                  <FormLabel>ETHEREUM_NODE_HTTP_URL</FormLabel>
                  <Input value={ETHEREUM_NODE_HTTP_URL} isReadOnly />
                </FormControl>

                <FormControl>
                  <FormLabel>ERC20_CONTRACT_ADDRESS</FormLabel>
                  <Input value={ERC20_CONTRACT_ADDRESS} isReadOnly />
                </FormControl>
              </Stack>

              <FormControl>
                <FormLabel>HTTP_URL_CND</FormLabel>
                <Input value={HTTP_URL_CND} isReadOnly />
              </FormControl>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
