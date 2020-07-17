import React, { useState, useEffect } from 'react';
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Text,
  Icon
} from '@chakra-ui/core';
import { ethers } from 'ethers';
import Store from 'electron-store';
import useSWR from 'swr';
import { useEthereumWallet } from '../hooks/useEthereumWallet';
import { useBitcoinWallet } from '../hooks/useBitcoinWallet';

export default function Balances() {
  const { wallet: ETHWallet, loaded: ETHLoaded } = useEthereumWallet();
  const { wallet: BTCWallet, loaded: BTCLoaded } = useBitcoinWallet();
  const [ETHBalance, setETHBalance] = useState(null);
  const [DAIBalance, setDAIBalance] = useState(null);
  const [BTCBalance, setBTCBalance] = useState(null);

  const fetcher = (input: RequestInfo, init?: RequestInit) =>
    fetch(input, init).then(res => res.json());
  const { data: BTCPriceData } = useSWR(
    'https://api.coincap.io/v2/rates/bitcoin',
    fetcher
  );
  const { data: ETHPriceData } = useSWR(
    'https://api.coincap.io/v2/rates/ethereum',
    fetcher
  );
  const { data: DAIPriceData } = useSWR(
    'https://api.coincap.io/v2/rates/multi-collateral-dai',
    fetcher
  );

  const [BTCFiatAmount, setBTCFiatAmount] = useState(null);
  const [ETHFiatAmount, setETHFiatAmount] = useState(null);
  const [DAIFiatAmount, setDAIFiatAmount] = useState(null);

  const settings = new Store();

  useEffect(() => {
    async function loadETHBalance() {
      const eth = await ETHWallet.getBalance();
      setETHBalance(ethers.utils.formatEther(eth));
    }

    if (ETHWallet) loadETHBalance();
  }, [ETHLoaded]);

  useEffect(() => {
    async function loadDAIBalance() {
      const dai = await ETHWallet.getErc20Balance(
        settings.get('ERC20_CONTRACT_ADDRESS')
      );
      setDAIBalance(dai.toString());
    }

    if (ETHWallet) loadDAIBalance();
  }, [ETHLoaded]);

  useEffect(() => {
    async function loadBTCBalance() {
      const BTC = await BTCWallet.getBalance();
      setBTCBalance(BTC);
    }

    if (BTCWallet) loadBTCBalance();
  }, [BTCLoaded]);

  useEffect(() => {
    async function calculateETHFiatAmount() {
      if (ETHPriceData) {
        const rate = ETHPriceData.data.rateUsd;
        setETHFiatAmount((ETHBalance * rate).toFixed(2));
      }
    }
    calculateETHFiatAmount();
  }, [ETHBalance]);

  useEffect(() => {
    async function calculateDAIFiatAmount() {
      if (DAIPriceData) {
        const rate = DAIPriceData.data.rateUsd;
        setDAIFiatAmount((DAIBalance * rate).toFixed(2));
      }
    }
    calculateDAIFiatAmount();
  }, [DAIBalance]);

  useEffect(() => {
    async function calculateBTCFiatAmount() {
      if (BTCPriceData) {
        const rate = BTCPriceData.data.rateUsd;
        setBTCFiatAmount((BTCBalance * rate).toFixed(2));
      }
    }
    calculateBTCFiatAmount();
  }, [BTCBalance]);

  return (
    <div>
      <StatGroup>
        <Flex
          width="100%"
          justifyContent="space-between"
          bg="white"
          p={5}
          shadow="md"
        >
          <Stat>
            <StatLabel>BTC</StatLabel>
            <StatNumber>{BTCBalance}</StatNumber>
            <StatHelpText>USD ${BTCFiatAmount}</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>ETH</StatLabel>
            <StatNumber>{ETHBalance}</StatNumber>
            <StatHelpText>USD ${ETHFiatAmount}</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>DAI</StatLabel>
            <StatNumber>{DAIBalance}</StatNumber>
            <StatHelpText>USD ${DAIFiatAmount}</StatHelpText>
          </Stat>
        </Flex>
      </StatGroup>
      <Text mt={2} fontSize="0.7em" float="left" color="gray.600">
        <Icon name="info" mt="-2px" color="gray.300" mr={1} /> Live market data
        from CoinMarketCap &bull; Last updated 4 minutes ago.
      </Text>
    </div>
  );
}
