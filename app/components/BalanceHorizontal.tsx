import React, {useEffect, useState} from 'react';
import {Flex, StatGroup} from '@chakra-ui/core';
import {BigNumber, ethers} from 'ethers';
import Store from 'electron-store';
import {useEthereumWallet} from '../hooks/useEthereumWallet';
import {useBitcoinWallet} from '../hooks/useBitcoinWallet';
import CurrencyAmount, {amountToUnitString, Currency, CurrencyUnit, shortenAmountString} from "./CurrencyAmount";

export default function BalanceHorizontal() {
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
          bg="white"
          p={2}
          shadow="md"
          justifyContent="space-evenly"
          minWidth="600px"
        >

          <CurrencyAmount
              amount={btcBalance}
              currency={Currency.BTC}
              unit={CurrencyUnit.BTC}
              topText={"BTC"}
              subText1={"Available: " +
                shortenAmountString(
                    amountToUnitString(btcBalance - btcReserved, CurrencyUnit.BTC),
                    10)}
              subText2={"Locked in orders: " +
                shortenAmountString(
                    amountToUnitString(btcReserved, CurrencyUnit.BTC),
                    6)}
              amountShortenPosition={8}
              amountFontSize={"14pt"}
          />
          <CurrencyAmount
              amount={daiBalance}
              currency={Currency.DAI}
              unit={CurrencyUnit.DAI}
              topText={"DAI"}
              subText1={"Available: " + shortenAmountString(amountToUnitString(daiBalance - daiReserved, CurrencyUnit.DAI), 10)}
              subText2={"Locked in orders: " + shortenAmountString(amountToUnitString(daiReserved, CurrencyUnit.DAI), 6)}
              amountShortenPosition={8}
              amountFontSize={"14pt"}
          />
          <CurrencyAmount
              amount={ethBalance}
              currency={Currency.ETH}
              unit={CurrencyUnit.ETHER}
              topText={"ETH"}
              subText1={"Available: " + shortenAmountString(amountToUnitString(ethBalance - ethReserved, CurrencyUnit.ETHER), 10)}
              subText2={"Locked in orders: " + shortenAmountString(amountToUnitString(ethReserved, CurrencyUnit.ETHER), 6)}
              amountShortenPosition={8}
              amountFontSize={"14pt"}
          />

        </Flex>
      </StatGroup>
    </div>
  );
}
