import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, StatGroup } from '@chakra-ui/core';
import { BigNumber } from 'ethers';
import Store from 'electron-store';
import { useEthereumWallet } from '../hooks/useEthereumWallet';
import { useBitcoinWallet } from '../hooks/useBitcoinWallet';
import CurrencyAmount from './CurrencyAmount';
import {
  amountToUnitString,
  btcIntoCurVal,
  daiIntoCurVal,
  ethIntoCurVal,
  intoBook,
  intoOrders
} from '../utils/types';
import { mockOrders } from './MockData';

// TODO: Rethink if this should keep its own state.
export default function BalanceHorizontal() {
  // TODO: Replace with actual data
  const myOrders = intoOrders(mockOrders());

  const { wallet: ethWallet } = useEthereumWallet();
  const { wallet: btcWallet } = useBitcoinWallet();

  // TODO: To be replaced with using CurrencyValue only, refactor once there is time
  const [ethBalanceAsCurrencyValue, setEthBalanceAsCurrencyValue] = useState(
    null
  );
  const [daiBalanceAsCurrencyValue, setDaiBalanceAsCurrencyValue] = useState(
    null
  );
  const [btcBalanceAsCurrencyValue, setBtcBalanceAsCurrencyValue] = useState(
    null
  );

  const [book, setBook] = useState(null);
  const settings = new Store();

  useEffect(() => {
    async function loadEthBalance() {
      const eth = await ethWallet.getBalance();
      const ethBigNumber = BigNumber.from(eth);
      const ethCurrencyValue = ethIntoCurVal(ethBigNumber);
      setEthBalanceAsCurrencyValue(ethCurrencyValue);
    }

    if (ethWallet) loadEthBalance();
  }, [ethWallet]);

  useEffect(() => {
    async function loadDaiBalance() {
      const dai = await ethWallet.getErc20Balance(
        settings.get('ERC20_CONTRACT_ADDRESS')
      );
      const daiCurrencyValue = daiIntoCurVal(dai);
      setDaiBalanceAsCurrencyValue(daiCurrencyValue);
    }

    if (ethWallet) loadDaiBalance();
  }, [ethWallet]);

  useEffect(() => {
    async function loadBtcBalance() {
      const btc = await btcWallet.getBalance();
      const btcBalanceInSats = btc;
      const btcCurrencyValue = btcIntoCurVal(btcBalanceInSats);
      setBtcBalanceAsCurrencyValue(btcCurrencyValue);
    }

    if (btcWallet) loadBtcBalance();
  }, [btcWallet]);

  useEffect(() => {
    setBook(
      intoBook(
        btcBalanceAsCurrencyValue,
        daiBalanceAsCurrencyValue,
        ethBalanceAsCurrencyValue,
        myOrders
      )
    );
  }, [
    ethBalanceAsCurrencyValue,
    btcBalanceAsCurrencyValue,
    daiBalanceAsCurrencyValue
  ]);

  if (!book) {
    // TODO: Proper init handling
    return (
      <Box>
        <Heading>Loading...</Heading>
      </Box>
    );
  }

  return (
    <div>
      <StatGroup>
        <Flex
          bg="white"
          p={2}
          shadow="md"
          justifyContent="space-evenly"
          minWidth="600px"
        >
          <CurrencyAmount
            currencyValue={book.btcTotal}
            topText="BTC"
            subText1={`Available: ${amountToUnitString(
              book.btcAvailableForTrading
            )}`}
            subText2={`Locked in orders: ${amountToUnitString(
              book.btcInOrders
            )}`}
            amountFontSize="14pt"
          />
          <CurrencyAmount
            currencyValue={book.daiTotal}
            topText="DAI"
            subText1={`Available: ${amountToUnitString(
              book.daiAvailableForTrading
            )}`}
            subText2={`Locked in orders: ${amountToUnitString(
              book.daiInOrders
            )}`}
            amountFontSize="14pt"
          />
          <CurrencyAmount
            currencyValue={book.ethTotal}
            topText="ETH"
            subText1={`Available: ${amountToUnitString(
              book.ethAvailableForTrading
            )}`}
            subText2={`Locked in orders: ${amountToUnitString(
              book.ethInOrders
            )}`}
            amountFontSize="14pt"
          />
        </Flex>
      </StatGroup>
    </div>
  );
}
