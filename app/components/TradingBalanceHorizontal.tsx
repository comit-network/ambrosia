import React, { useEffect, useState } from 'react';
import {
  Flex,
  Image,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber
} from '@chakra-ui/core';
import { BigNumber, ethers } from 'ethers';
import Store from 'electron-store';
import { useEthereumWallet } from '../hooks/useEthereumWallet';
import { useBitcoinWallet } from '../hooks/useBitcoinWallet';
import BitcoinIcon from '../assets/Bitcoin.svg';
import DaiIcon from '../assets/Dai.svg';
import EthereumIcon from '../assets/Ethereum.svg';

export default function TradingBalanceHorizontal() {
  const { wallet: ethWallet, loaded: ethWalletLoaded } = useEthereumWallet();
  const { wallet: btcWallet, loaded: btcWalletLoaded } = useBitcoinWallet();
  const [ethBalance, setEthBalance] = useState(null);
  const [daiBalance, setDaiBalance] = useState(null);
  const [btcBalance, setBtcBalance] = useState(null);

  // TODO: [CndApi] ? - or should we calc that ourselves
  // FixMe: [MockData]
  const ethReserved = 0.0001;
  const daiReserved = 50;
  const btcReserved = 0.5;

  const settings = new Store();

  useEffect(() => {
    async function loadEthBalance() {
      const eth = await ethWallet.getBalance();
      // TODO: constructing BigNumber again should be unnecessary, but tsc complains
      setEthBalance(ethers.utils.formatEther(BigNumber.from(eth)));
    }

    if (ethWallet) loadEthBalance();
  }, [ethWalletLoaded]);

  useEffect(() => {
    async function loadDaiBalance() {
      const dai = await ethWallet.getErc20Balance(
        settings.get('ERC20_CONTRACT_ADDRESS')
      );
      setDaiBalance(dai.toString());
    }

    if (ethWallet) loadDaiBalance();
  }, [ethWalletLoaded]);

  useEffect(() => {
    async function loadBtcBalance() {
      const btc = await btcWallet.getBalance();
      setBtcBalance(btc);
    }

    if (btcWallet) loadBtcBalance();
  }, [btcWalletLoaded]);

  return (
    <div>
      <StatGroup>
        <Flex
          width="600px"
          bg="white"
          p={2}
          paddingLeft={5}
          shadow="md"
          justifyContent="space-evenly"
        >
          <Stat>
            <StatLabel>Available BTC</StatLabel>
            <Flex direction="row" alignContent="center">
              <Image
                src={BitcoinIcon}
                height="1.5rem"
                marginRight="0.5rem"
                alignSelf="center"
              />
              <StatNumber>{btcBalance - btcReserved}</StatNumber>
            </Flex>
            <StatHelpText>Locked in orders: {btcReserved}</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Available DAI</StatLabel>
            <Flex direction="row" alignContent="center">
              <Image
                src={DaiIcon}
                height="1.5rem"
                marginRight="0.5rem"
                alignSelf="center"
              />
              <StatNumber>{daiBalance - daiReserved}</StatNumber>
            </Flex>
            <StatHelpText>Locked in orders {daiReserved}</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Available ETH</StatLabel>
            <Flex direction="row" alignContent="center">
              <Image
                src={EthereumIcon}
                height="1.5rem"
                marginRight="0.5rem"
                alignSelf="center"
              />
              <StatNumber>{ethBalance - ethReserved}</StatNumber>
            </Flex>
            <StatHelpText>Locked in orders: {ethReserved} </StatHelpText>
          </Stat>
        </Flex>
      </StatGroup>
    </div>
  );
}
