import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftAddon,
  Stack
} from '@chakra-ui/core';
import React from 'react';
import { Field, Formik } from 'formik';
import { LedgerBitcoinWallet } from '../hooks/useLedgerBitcoinWallet';
import { LedgerClient } from '../ledgerIpc';
import { ipcRenderer } from 'electron';

export default function SetupPage() {

  return <Box ml={'auto'} mr={'auto'} maxWidth={'80ch'} boxSizing={'content-box'}>

    <Stack spacing={8} mt={'5rem'}>
      <Heading fontSize={'6xl'} as={'h1'}>
        Setup
      </Heading>

      <Formik
        initialValues={{ bitcoinRpcEndpoint: '__cookie__:e0f338faac5548a2476cfdc4363007148aa2d5e1719d8949301930e873b87313@localhost:18443', web3Endpoint: 'localhost:8545', bitcoinLedgerAccountIndex: 0, ethereumLedgerAccountIndex: 0 }}
        onSubmit={async (values, actions) => {
          const bitcoinWallet = new LedgerBitcoinWallet(new LedgerClient(ipcRenderer), `http://${values.bitcoinRpcEndpoint}`);

          try {
            await bitcoinWallet.getConnectedNetwork();
          } catch (e) {
            actions.setFieldError('bitcoinRpcEndpoint', `Unable to connect to this node: ${e}`)
            return;
          }

          try {
            await bitcoinWallet.createWallet();
          } catch (e) {
            actions.setFieldError('bitcoinRpcEndpoint', `Unable to create watch-only wallet: ${e}`)
            return;
          }

          try {
            await bitcoinWallet.importLedgerKeys(values.bitcoinLedgerAccountIndex);
          } catch (e) {
            actions.setFieldError('bitcoinLedgerAccountIndex', `Unable to import account: ${e}`)
            return;
          }
        }}
      >
        {props => (
          <form onSubmit={props.handleSubmit}>
            <Stack spacing={8}>
              <Box>
                <Field name="bitcoinRpcEndpoint" mb={4} validate={(url) => {
                  if (!url || url.length === 0) {
                    return "URL cannot be empty!"
                  }

                  // TODO: Fancy validation where we connect to the node and display a little green icon on the right?

                  return undefined;
                }}>
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.bitcoinRpcEndpoint && form.touched.bitcoinRpcEndpoint}>
                      <FormLabel htmlFor="bitcoinRpcEndpoint">Bitcoin-Core RPC endpoint</FormLabel>
                      <InputGroup>
                        <InputLeftAddon children="http://"/>
                        <Input {...field} type="text" id="bitcoinRpcEndpoint" aria-describedby="bitcoin_core_endpoint_helper_text"
                               placeholder={'username:password@localhost:8332'} />
                      </InputGroup>
                      <FormHelperText id="bitcoin_core_endpoint_helper_text">
                        The URL to your Bitcoin-Core node. Take care to provide the right port depending on the network!
                      </FormHelperText>
                      <FormErrorMessage>{form.errors.bitcoinRpcEndpoint}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </Box>
              <Box>
                <Field name="web3Endpoint" validate={(url) => {
                  if (!url || url.length === 0) {
                    return "URL cannot be empty!"
                  }

                  // TODO: Fancy validation where we connect to the node and display a little green icon on the right?

                  return undefined;
                }}>
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.web3Endpoint && form.touched.web3Endpoint}>
                      <FormLabel htmlFor="web3Endpoint">Ethereum Web3 endpoint</FormLabel>
                      <InputGroup>
                        <InputLeftAddon children="http://"/>
                        <Input {...field} type="text" id="web3Endpoint" aria-describedby="web3Endpoint_helper_text"
                               placeholder={'localhost:8545'} />
                      </InputGroup>
                      <FormHelperText id="web3Endpoint_helper_text">
                        The URL to your Ethereum node. Can be Infura as well!
                      </FormHelperText>
                      <FormErrorMessage>{form.errors.web3Endpoint}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </Box>
              <Box>
                <Stack direction={"row"} spacing={4}>
                  <Box>
                    <Field name="bitcoinLedgerAccountIndex" validate={(index) => {
                      if (Number.parseInt(index, 10) < 0) {
                        return "Must be a positive number!"
                      }
                      return undefined;
                    }}>
                      {({ field, form }) => (
                        <FormControl isInvalid={form.errors.bitcoinLedgerAccountIndex && form.touched.bitcoinLedgerAccountIndex}>
                          <FormLabel htmlFor="bitcoinLedgerAccountIndex">Nano Ledger Bitcoin Account</FormLabel>
                          <InputGroup>
                            <InputLeftAddon children="m/84'/0'/"/>
                            <Input {...field} type="number" id="bitcoinLedgerAccountIndex" aria-describedby="bitcoinLedgerAccountIndex_helper_text"
                                   placeholder={'0'} />
                            <InputLeftAddon children="/0/*"/>
                          </InputGroup>
                          <FormHelperText id="bitcoinLedgerAccountIndex_helper_text">
                            The Bitcoin account on your Nano Ledger that you would like use.
                          </FormHelperText>
                          <FormErrorMessage>{form.errors.bitcoinLedgerAccountIndex}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </Box>
                  <Box>
                    <Field name="ethereumLedgerAccountIndex" validate={(index) => {
                      if (Number.parseInt(index, 10) < 0) {
                        return "Must be a positive number!"
                      }
                      return undefined;
                    }}>
                      {({ field, form }) => (
                        <FormControl isInvalid={form.errors.ethereumLedgerAccountIndex && form.touched.ethereumLedgerAccountIndex}>
                          <FormLabel htmlFor="ethereumLedgerAccountIndex">Nano Ledger Ethereum Account</FormLabel>
                          <InputGroup>
                            <InputLeftAddon children="m/44'/60'/"/>
                            <Input {...field} type="number" id="ethereumLedgerAccountIndex" aria-describedby="ethereumLedgerAccountIndex_helper_text"
                                   placeholder={'0'} />
                            <InputLeftAddon children="/0"/>
                          </InputGroup>
                          <FormHelperText id="ethereumLedgerAccountIndex_helper_text">
                            The Ethereum account on your Nano Ledger that you would like use. Most likely `0`.
                          </FormHelperText>
                          <FormErrorMessage>{form.errors.ethereumLedgerAccountIndex}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </Box>
                </Stack>
              </Box>
              <Box w={"100%"}>
                <Button
                  variantColor="green"
                  isLoading={props.isSubmitting}
                  type="submit"
                  w={"100%"}
                >
                  Setup!
                </Button>
                <FormHelperText>
                  Klicking "Setup!" will verify the connection to the blockchain nodes and setup a watch-only wallet on the Bitcoin node using the Extended Public Key from your Nano Ledger. Your Ledger must be unlocked with the Bitcoin app open for this to succeed.
                </FormHelperText>
              </Box>
            </Stack>
          </form>
        )}
      </Formik>
    </Stack>
  </Box>;
}
