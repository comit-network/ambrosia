import React, { useState, useEffect } from 'react';
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
import useSWR from 'swr';
import { useEthereumWallet } from '../hooks/useEthereumWallet';
import { useBitcoinWallet } from '../hooks/useBitcoinWallet';
import { useCnd } from '../hooks/useCnd';

const settings = new Store();

export default function SettingsPage() {
  const BITCOIN_HD_KEY = settings.get('BITCOIN_HD_KEY');
  const BITCOIN_P2P_URI = settings.get('BITCOIN_P2P_URI');
  const ETHEREUM_KEY = settings.get('ETHEREUM_KEY');
  const ETHEREUM_NODE_HTTP_URL = settings.get('ETHEREUM_NODE_HTTP_URL');
  const ERC20_CONTRACT_ADDRESS = settings.get('ERC20_CONTRACT_ADDRESS');
  const HTTP_URL_CND = settings.get('HTTP_URL_CND');

  const { wallet: ETHWallet, loaded: ETHLoaded } = useEthereumWallet();
  const [ETHAddress, setETHAddress] = useState(null);
  const { wallet: BTCWallet, loaded: BTCLoaded } = useBitcoinWallet();
  const [BTCAddress, setBTCAddress] = useState(null);
  const { cnd, loaded: cndLoaded } = useCnd();
  const [cndDetails, setCndDetails] = useState({
    id: null,
    listenAddresses: []
  });

  useEffect(() => {
    async function loadETHBalance() {
      const ethAddress = ETHWallet.getAccount();
      setETHAddress(ethAddress);
    }

    loadETHBalance();
  }, [ETHLoaded]);

  useEffect(() => {
    async function loadBTCBalance() {
      const btcAddress = await BTCWallet.getAddress();
      setBTCAddress(btcAddress);
    }

    loadBTCBalance();
  }, [BTCLoaded]);

  useEffect(() => {
    async function loadCnd() {
      const id = await cnd.getPeerId();
      const listenAddresses = await cnd.getPeerListenAddresses();

      setCndDetails({
        id,
        listenAddresses
      });
    }

    loadCnd();
  }, [cndLoaded]);

  // Maker settings
  const MAKER_ETHEREUM_KEY = settings.get('MAKER_ETHEREUM_KEY');
  const MAKER_BITCOIN_HD_KEY = settings.get('MAKER_BITCOIN_HD_KEY');
  const MAKER_HTTP_URL_CND = settings.get('MAKER_HTTP_URL_CND');
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: makerCndDetails } = useSWR(
    settings.get('MAKER_HTTP_URL_CND'),
    fetcher
  );

  useEffect(() => {
    async function loadCnd() {
      const id = await cnd.getPeerId();
      const listenAddresses = await cnd.getPeerListenAddresses();

      setCndDetails({
        id,
        listenAddresses
      });
    }

    loadCnd();
  }, [cndLoaded]);

  return (
    <Box width="100%">
      <Heading fontSize="1.8em" mb={8}>
        Settings
      </Heading>

      <Tabs variant="soft-rounded" variantColor="cyan">
        <TabList mb={4}>
          <Tab>General</Tab>
          <Tab>Debug</Tab>
          <Tab>Maker</Tab>
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
                  <FormLabel>Cnd Id</FormLabel>
                  <Input value={cndDetails.id} />
                </FormControl>

                <FormControl>
                  <FormLabel>Cnd listen addresses</FormLabel>
                  <Input value={cndDetails.listenAddresses.toString()} />
                </FormControl>

                <FormControl>
                  <FormLabel>Bitcoin Wallet Address</FormLabel>
                  <Input value={BTCAddress} />
                </FormControl>

                <FormControl>
                  <FormLabel>BITCOIN_HD_KEY</FormLabel>
                  <Input value={BITCOIN_HD_KEY} />
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
                  <FormLabel>Ethereum Wallet Address</FormLabel>
                  <Input value={ETHAddress} />
                </FormControl>

                <FormControl>
                  <FormLabel>ETHEREUM_NODE_HTTP_URL</FormLabel>
                  <Input value={ETHEREUM_NODE_HTTP_URL} isReadOnly />
                </FormControl>

                <FormControl>
                  <FormLabel>ERC20_CONTRACT_ADDRESS</FormLabel>
                  <Input value={ERC20_CONTRACT_ADDRESS} isReadOnly />
                </FormControl>

                <FormControl>
                  <FormLabel>HTTP_URL_CND</FormLabel>
                  <Input value={HTTP_URL_CND} isReadOnly />
                </FormControl>
              </Stack>
            </Box>
          </TabPanel>
          <TabPanel>
            <Box bg="white" p={5} shadow="md" borderWidth="1px">
              <Heading>Maker</Heading>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Maker id</FormLabel>
                  <Input value={makerCndDetails.id} />
                </FormControl>

                <FormControl>
                  <FormLabel>Maker listen addresses</FormLabel>
                  <Input
                    value={JSON.stringify(makerCndDetails.listen_addresses)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>MAKER_BITCOIN_HD_KEY</FormLabel>
                  <Input value={MAKER_BITCOIN_HD_KEY} />
                </FormControl>

                <FormControl>
                  <FormLabel>MAKER_ETHEREUM_KEY</FormLabel>
                  <Input value={MAKER_ETHEREUM_KEY} isReadOnly />
                </FormControl>

                <FormControl>
                  <FormLabel>MAKER_HTTP_URL_CND</FormLabel>
                  <Input value={MAKER_HTTP_URL_CND} isReadOnly />
                </FormControl>
              </Stack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
