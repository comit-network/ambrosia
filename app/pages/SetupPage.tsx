import {
  Box,
  Button,
  Collapse,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  ListIcon,
  Spinner,
  Stack
} from '@chakra-ui/core';
import React, { useState } from 'react';
import { Field, Formik } from 'formik';
import { LedgerBitcoinWallet } from '../hooks/useLedgerBitcoinWallet';
import { Descriptors, LedgerClient } from '../ledgerIpc';
import { ipcRenderer } from 'electron';
import { sleep } from '../comit-sdk/util/sleep';
import { LedgerEthereumWallet } from '../hooks/useLedgerEthereumWallet';

interface StatusProps<T> {
  progress: Progress<T>
}

function BitcoinConnectionStatus({ progress }: StatusProps<string>) {
  if (progress.inProgress) {
    return <>
      <Spinner size={'sm'} mr={2}/>
    </>;
  }

  if (progress.value) {
    return <>
      <ListIcon icon="check-circle" color="green.500"/>
    </>;
  }

  if (!progress.value && progress.attempted) {
    return <>
      <ListIcon icon="close" color="red.500"/>
    </>;
  }

  return null;
}

function EthereumConnectionStatus({ progress }: StatusProps<string>) {
  if (progress.inProgress) {
    return <>
      <Spinner size={'sm'} mr={2}/>
    </>;
  }

  if (progress.value) {
    return <>
      <ListIcon icon="check-circle" color="green.500"/>
    </>;
  }

  if (!progress.value && progress.attempted) {
    return <>
      <ListIcon icon="close" color="red.500"/>
    </>;
  }

  return null;
}

function ExportEthereumAccountStatus({ progress }: StatusProps<string>) {
  if (progress.inProgress) {
    return <>
      <Spinner size={'sm'} mr={2}/>
    </>;
  }

  if (progress.value) {
    return <>
      <ListIcon icon="check-circle" color="green.500"/>
    </>;
  }

  if (!progress.value && progress.attempted) {
    return <>
      <ListIcon icon="close" color="red.500"/>
    </>;
  }

  return null;
}

function CreateWalletStatus({ progress }: StatusProps<boolean>) {
  if (progress.inProgress) {
    return <>
      <Spinner size={'sm'} mr={2}/> Creating Bitcoin watch-only wallet ...
    </>;
  }

  if (progress.value) {
    return <>
      <ListIcon icon="check-circle" color="green.500"/> Created Bitcoin watch-only wallet
    </>;
  }

  if (!progress.value && progress.attempted) {
    return <>
      <ListIcon icon="close" color="red.500"/> Failed to create Bitcoin watch-only wallet: {progress.error.message}
    </>;
  }

  return null;
}

function ExportBitcoinAccountStatus({ progress }: StatusProps<Descriptors>) {
  if (progress.inProgress) {
    return <>
      <Spinner size={'sm'} mr={2}/>
    </>;
  }

  if (progress.value) {
    return <>
      <ListIcon icon="check-circle" color="green.500"/>
    </>;
  }

  if (!progress.value && progress.attempted) {
    return <>
      <ListIcon icon="close" color="red.500"/>
    </>;
  }

  return null
}

interface Props {
  onComplete: ({ bitcoinRpcEndpoint, web3Endpoint, bitcoinLedgerAccountIndex, ethereumLedgerAccountIndex, ethereumLedgerAccountAddress }) => void;
}

interface Progress<T> {
  inProgress: boolean,
  attempted: boolean,
  value?: T,
  error?: any
}

export default function SetupPage({ onComplete }: Props) {
  const [fetchBitcoinNetworkProgress, setFetchBitcoinNetworkProgress] = useState<Progress<string>>({
    inProgress: false,
    attempted: false
  });
  const [fetchEthereumChainProgress, setFetchEthereumChainProgress] = useState<Progress<string>>({
    inProgress: false,
    attempted: false
  });
  const [createWalletProgress, setCreateWalletProgress] = useState<Progress<boolean>>({
    inProgress: false,
    attempted: false
  });
  const [exportEthereumAccountProgress, setExportEthereumAccountProgress] = useState<Progress<string>>({
    inProgress: false,
    attempted: false
  });
  const [exportBitcoinAccountProgress, setExportBitcoinAccountProgress] = useState<Progress<Descriptors>>({
    inProgress: false,
    attempted: false
  });

  return <Box ml={'auto'} mr={'auto'} maxWidth={'80ch'} boxSizing={'content-box'}>

    <Stack spacing={8} mt={'5rem'}>
      <Heading fontSize={'6xl'} as={'h1'}>
        Setup
      </Heading>

      <Formik
        validateOnBlur
        initialValues={{
          bitcoinRpcEndpoint: '__cookie__:59838af3a5a06d5977f612acacb1c788370a2734dd7057e9442ed309f0557c6e@localhost:18443',
          web3Endpoint: 'https://ropsten.infura.io/v3/882e8bd8f15a488f9b025ce33c006b23',
          bitcoinLedgerAccountIndex: 0,
          ethereumLedgerAccountIndex: 0,
          ethereumLedgerAccountAddress: undefined
        }}
        // initialValues={{
        //   bitcoinRpcEndpoint: undefined,
        //   web3Endpoint: undefined,
        //   bitcoinLedgerAccountIndex: undefined,
        //   ethereumLedgerAccountIndex: undefined,
        //   ethereumLedgerAccountAddress: undefined
        // }}
        onSubmit={async (values, actions) => {
          let somethingFailed = false; // TODO: Instead of this, we should somehow use formik's `validate` function here

          const ledgerClient = new LedgerClient(ipcRenderer);

          const bitcoinWallet = new LedgerBitcoinWallet(ledgerClient, values.bitcoinLedgerAccountIndex, values.bitcoinRpcEndpoint);
          const ethereumWallet = new LedgerEthereumWallet(ledgerClient, {
            index: values.ethereumLedgerAccountIndex,
            address: ''
          }, values.web3Endpoint);

          if (!fetchEthereumChainProgress.value) {
            setFetchEthereumChainProgress({
              inProgress: true,
              attempted: true
            });
            try {
              const network = await ethereumWallet.getNetwork();
              await sleep(500);
              setFetchEthereumChainProgress({
                inProgress: false,
                value: network,
                attempted: true
              });
            } catch (e) {
              actions.setFieldError('web3Endpoint', `Unable to connect to node: ${e}`);
              setFetchEthereumChainProgress({
                inProgress: false,
                attempted: true,
                error: e
              });
              somethingFailed = true;
            }
          }

          if (!fetchBitcoinNetworkProgress.value) {
            setFetchBitcoinNetworkProgress({
              inProgress: true,
              attempted: true
            });
            try {
              const network = await bitcoinWallet.getConnectedNetwork();
              await sleep(500);
              setFetchBitcoinNetworkProgress({
                inProgress: false,
                value: network,
                attempted: true
              });
            } catch (e) {
              actions.setFieldError('bitcoinRpcEndpoint', `Unable to connect to node: ${e}`);
              setFetchBitcoinNetworkProgress({
                inProgress: false,
                attempted: true,
                error: e
              });
              somethingFailed = true;
            }
          }

          let address = exportEthereumAccountProgress.value;
          if (!exportEthereumAccountProgress.value) {
            setExportEthereumAccountProgress({
              inProgress: true,
              attempted: true
            });
            let error;
            for (let i = 0; i < 10; i++) {
              try {
                address = await ledgerClient.getEthereumAccount(values.ethereumLedgerAccountIndex);
                break;
              } catch (e) {
                error = e;
                await sleep(500);
              }
            }
            setExportEthereumAccountProgress({
              inProgress: false,
              value: address,
              attempted: true,
              error
            });
            if (!address) {
              actions.setFieldError('ethereumLedgerAccountIndex', `Failed to export Ethereum account from Ledger: ${error}`)
              somethingFailed = true;
            }
          }

          let descriptors;
          if (!exportBitcoinAccountProgress.value) {
            setExportBitcoinAccountProgress({
              inProgress: true,
              attempted: true
            });
            let error;
            for (let i = 0; i < 10; i++) {
              try {
                descriptors = await bitcoinWallet.exportLedgerWallet();
                break;
              } catch (e) {
                error = e;
                await sleep(500);
              }
            }
            setExportBitcoinAccountProgress({
              inProgress: false,
              value: descriptors,
              attempted: true,
              error
            });
            if (!descriptors) {
              actions.setFieldError('bitcoinLedgerAccountIndex', `Failed to export Bitcoin account from Ledger: ${error}`)
              somethingFailed = true;
            }
          }

          if (!createWalletProgress.value) {
            setCreateWalletProgress({
              inProgress: true,
              attempted: true
            });
            try {
              await bitcoinWallet.createWallet(descriptors);
              await sleep(500);
              setCreateWalletProgress({
                inProgress: false,
                value: true,
                attempted: true
              });
            } catch (e) {
              setCreateWalletProgress({
                inProgress: false,
                attempted: true,
                error: e
              });
              somethingFailed = true;
            }
          }

          if (!somethingFailed) {
            onComplete({
              ...values,
              ethereumLedgerAccountAddress: address
            });
          }
        }}
      >
        {props => (
          <form onSubmit={props.handleSubmit}>
            <Stack spacing={8}>
              <Box>
                <Field name="web3Endpoint" validate={(url) => {
                  if (!url || url.length === 0) {
                    return 'URL cannot be empty!';
                  }

                  // TODO: Fancy validation where we connect to the node and display a little green icon on the right?

                  return undefined;
                }}>
                  {({ field, form }) => (
                    <>
                      <FormControl isInvalid={form.errors.web3Endpoint && form.touched.web3Endpoint}>
                        <FormLabel htmlFor="web3Endpoint">Ethereum Web3 endpoint</FormLabel>
                        <InputGroup>
                          <Input {...field} type="text" id="web3Endpoint" aria-describedby="web3Endpoint_helper_text"
                                 placeholder={'http://localhost:8545'}/>
                          <InputRightElement>
                            <EthereumConnectionStatus progress={fetchEthereumChainProgress}/>
                          </InputRightElement>
                        </InputGroup>
                        <FormHelperText id="web3Endpoint_helper_text">
                          The URL to your Ethereum node. Can be Infura as well!
                        </FormHelperText>
                        <FormErrorMessage>{form.errors.web3Endpoint}</FormErrorMessage>
                      </FormControl>
                      <Collapse mt={2} isOpen={fetchEthereumChainProgress.value !== undefined}>
                        Connected to Ethereum network '{fetchEthereumChainProgress.value}'
                      </Collapse>
                    </>
                  )}
                </Field>
              </Box>
              <Box>
                <Field name="bitcoinRpcEndpoint" mb={4} validate={(url) => {
                  if (!url || url.length === 0) {
                    return 'URL cannot be empty!';
                  }

                  // TODO: Fancy validation where we connect to the node and display a little green icon on the right?

                  return undefined;
                }}>
                  {({ field, form }) => (
                    <>
                      <FormControl isInvalid={form.errors.bitcoinRpcEndpoint && form.touched.bitcoinRpcEndpoint}>
                        <FormLabel htmlFor="bitcoinRpcEndpoint">Bitcoin-Core RPC endpoint</FormLabel>
                        <InputGroup>
                          <InputLeftAddon children="http://"/>
                          <Input {...field} type="text" id="bitcoinRpcEndpoint"
                                 aria-describedby="bitcoin_core_endpoint_helper_text"
                                 placeholder={'username:password@localhost:8332'}/>
                          <InputRightElement>
                            <BitcoinConnectionStatus progress={fetchBitcoinNetworkProgress}/>
                          </InputRightElement>
                        </InputGroup>
                        <FormHelperText id="bitcoin_core_endpoint_helper_text">
                          The URL to your Bitcoin-Core node. Take care to provide the right port depending on the network!
                        </FormHelperText>
                        <FormErrorMessage>{form.errors.bitcoinRpcEndpoint}</FormErrorMessage>
                      </FormControl>
                      <Collapse mt={2} isOpen={fetchBitcoinNetworkProgress.value !== undefined}>
                        Connected to Bitcoin network '{fetchBitcoinNetworkProgress.value}'
                      </Collapse>
                    </>
                  )}
                </Field>
              </Box>

              <Box>
                <Field name="ethereumLedgerAccountIndex" validate={(index) => {
                  if (Number.parseInt(index, 10) < 0) {
                    return 'Must be a positive number!';
                  }
                  return undefined;
                }}>
                  {({ field, form }) => (
                    <>
                      <FormControl
                        isInvalid={form.errors.ethereumLedgerAccountIndex && form.touched.ethereumLedgerAccountIndex}>
                        <FormLabel htmlFor="ethereumLedgerAccountIndex">Nano Ledger Ethereum Account</FormLabel>
                        <InputGroup>
                          <InputLeftAddon children="m/44'/60'/"/>
                          <Input {...field} type="number" id="ethereumLedgerAccountIndex"
                                 aria-describedby="ethereumLedgerAccountIndex_helper_text"
                                 placeholder={'0'}/>
                          <InputRightElement>
                            <ExportEthereumAccountStatus progress={exportEthereumAccountProgress}/>
                          </InputRightElement>
                        </InputGroup>
                        <FormHelperText id="ethereumLedgerAccountIndex_helper_text">
                          The Ethereum account on your Nano Ledger that you would like use. Most likely `0`.
                        </FormHelperText>
                        <FormErrorMessage>{form.errors.ethereumLedgerAccountIndex}</FormErrorMessage>
                      </FormControl>
                      <Collapse mt={2} isOpen={exportEthereumAccountProgress.inProgress}>
                        Please unlock your Ledger and open the Ethereum app.
                      </Collapse>
                    </>
                  )}
                </Field>
              </Box>
              <Box>
                <Field name="bitcoinLedgerAccountIndex" validate={(index) => {
                  if (Number.parseInt(index, 10) < 0) {
                    return 'Must be a positive number!';
                  }
                  return undefined;
                }}>
                  {({ field, form }) => (
                    <>
                      <FormControl
                        isInvalid={form.errors.bitcoinLedgerAccountIndex && form.touched.bitcoinLedgerAccountIndex}>
                        <FormLabel htmlFor="bitcoinLedgerAccountIndex">Nano Ledger Bitcoin Account</FormLabel>
                        <InputGroup>
                          <InputLeftAddon children="m/84'/0'/"/>
                          <Input {...field} type="number" id="bitcoinLedgerAccountIndex"
                                 aria-describedby="bitcoinLedgerAccountIndex_helper_text"
                                 placeholder={'0'}/>
                          <InputRightElement>
                            <ExportBitcoinAccountStatus progress={exportBitcoinAccountProgress}/>
                          </InputRightElement>
                        </InputGroup>
                        <FormHelperText id="bitcoinLedgerAccountIndex_helper_text">
                          The Bitcoin account on your Nano Ledger that you would like use.
                        </FormHelperText>
                        <FormErrorMessage>{form.errors.bitcoinLedgerAccountIndex}</FormErrorMessage>
                      </FormControl>
                      <Collapse mt={2} isOpen={exportBitcoinAccountProgress.inProgress}>
                        Please unlock your Ledger and open the Bitcoin app.
                      </Collapse>
                    </>
                  )}
                </Field>
              </Box>

              <Box>
                <Collapse mt={2} isOpen={createWalletProgress.attempted && createWalletProgress.value === undefined}>
                  <CreateWalletStatus progress={createWalletProgress} />
                </Collapse>
              </Box>
              <Box w={'100%'}>
                <Button
                  variantColor="green"
                  isLoading={props.isSubmitting}
                  type="submit"
                  w={'100%'}
                >
                  Setup!
                </Button>
              </Box>
            </Stack>
          </form>
        )}
      </Formik>
    </Stack>
  </Box>;
}
