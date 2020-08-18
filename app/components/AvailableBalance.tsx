import React, {useEffect, useState} from 'react';
import {StatGroup} from '@chakra-ui/core';
import {BigNumber, ethers} from 'ethers';
import Store from 'electron-store';
import {useEthereumWallet} from '../hooks/useEthereumWallet';
import {useBitcoinWallet} from '../hooks/useBitcoinWallet';
import CurrencyAmount, {amountToUnitString, Currency, CurrencyUnit, shortenAmountString} from './CurrencyAmount';

export default function AvailableBalance() {
  const { wallet: ethWallet, loaded: ethWalletLoaded } = useEthereumWallet();
  const { wallet: btcWallet, loaded: btcWalletLoaded } = useBitcoinWallet();
  const [ethBalance, setEthBalance] = useState(null);
  const [daiBalance, setDaiBalance] = useState(null);
  const [btcBalance, setBtcBalance] = useState(null);

  // TODO: [CndApi] ? - or should we calc that ourselves
  // FixMe: [MockData]
  const ethReserved = 111.11111;
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
      <StatGroup>
          <CurrencyAmount
            amount={btcBalance - btcReserved}
            currency={Currency.BTC}
            unit={CurrencyUnit.BTC}
            topText="Available BTC"
            subText1={`In orders: ${shortenAmountString(
              amountToUnitString(btcReserved, CurrencyUnit.BTC),
              6
            )}`}
            amountShortenPosition={8}
            amountFontSize="14pt"
          />
          <CurrencyAmount
            amount={daiBalance - daiReserved}
            currency={Currency.DAI}
            unit={CurrencyUnit.DAI}
            topText="Available DAI"
            subText1={`In orders: ${shortenAmountString(
              amountToUnitString(daiReserved, CurrencyUnit.DAI),
              6
            )}`}
            amountShortenPosition={8}
            amountFontSize="14pt"
          />
          <CurrencyAmount
            amount={ethBalance - ethReserved}
            currency={Currency.ETH}
            unit={CurrencyUnit.ETHER}
            topText="Available ETH"
            subText1={`In orders: ${shortenAmountString(
              amountToUnitString(ethReserved, CurrencyUnit.ETHER),
              6
            )}`}
            amountShortenPosition={8}
            amountFontSize="14pt"
          />
      </StatGroup>
  );
}
