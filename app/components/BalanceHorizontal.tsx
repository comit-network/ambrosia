import React, {useEffect, useState} from 'react';
import {Flex, StatGroup} from '@chakra-ui/core';
import CurrencyAmount from './CurrencyAmount';
import {
  amountToUnitString,
  btcIntoCurVal,
  daiIntoCurVal,
  ethIntoCurVal,
  ZERO_BTC,
  ZERO_DAI,
  ZERO_ETH
} from '../utils/currency';
import {useLedgerEthereumWallet} from '../hooks/useLedgerEthereumWallet';
import {useLedgerBitcoinWallet} from '../hooks/useLedgerBitcoinWallet';
import {intoOrders} from '../utils/order';
import {Book, intoBook} from '../utils/book';
import {Config} from '../config';
import {useCnd} from "../hooks/useCnd";
import useSWR from "swr/esm/use-swr";

interface Props {
  settings: Config
}

// TODO: Rethink if this should keep its own state.
export default function BalanceHorizontal({settings}: Props) {

  const ethWallet = useLedgerEthereumWallet();
  const btcWallet = useLedgerBitcoinWallet();
  const cnd = useCnd();

  const [ethBalanceAsCurrencyValue, setEthBalanceAsCurrencyValue] = useState(
      ZERO_ETH
  );
  const [daiBalanceAsCurrencyValue, setDaiBalanceAsCurrencyValue] = useState(
      ZERO_DAI
  );
  const [btcBalanceAsCurrencyValue, setBtcBalanceAsCurrencyValue] = useState(
      ZERO_BTC
  );
  const [book, setBook] = useState<Book>({
    btcAvailableForTrading: ZERO_BTC,
    btcInOrders: ZERO_BTC,
    btcTotal: ZERO_BTC,
    daiAvailableForTrading: ZERO_DAI,
    daiInOrders: ZERO_DAI,
    daiTotal: ZERO_DAI,
    ethAvailableForTrading: ZERO_ETH,
    ethInOrders: ZERO_ETH,
    ethTotal: ZERO_ETH

  });

  useEffect(() => {
    async function loadEthBalance() {
      try {
        const eth = await ethWallet.getEtherBalance();
        const ethCurrencyValue = ethIntoCurVal(eth);
        setEthBalanceAsCurrencyValue(ethCurrencyValue);
      } catch (e) {
        console.error(e);
        console.warn("Falling back to ETH balance 0.")
      }

      try {
        const dai = await ethWallet.getErc20Balance(
            settings.ERC20_CONTRACT_ADDRESS
        );
        const daiCurrencyValue = daiIntoCurVal(dai);
        setDaiBalanceAsCurrencyValue(daiCurrencyValue);
      } catch (e) {
        console.error(e);
        console.warn("Falling back to DAI balance 0.")
      }
    }

    if (ethWallet) loadEthBalance();
  }, [ethWallet]);

  useEffect(() => {
    async function loadBtcBalance() {
      try {
        const sats = await btcWallet.getBalance();
        const btcCurrencyValue = btcIntoCurVal(sats);
        setBtcBalanceAsCurrencyValue(btcCurrencyValue);
      } catch (e) {
        console.error(e);
        console.warn("Falling back to BTC balance 0.")
      }
    }

    if (btcWallet) loadBtcBalance();
  }, [btcWallet]);

  let ordersEndpoint = "/orders";
  const { data: orders } = useSWR(
      () => ordersEndpoint,
      () => cnd.fetch(ordersEndpoint).then(intoOrders),
      {
        refreshInterval: 1000,
        initialData: []
      }
  );

  useEffect(() => {
    setBook(
        intoBook(
            btcBalanceAsCurrencyValue,
            daiBalanceAsCurrencyValue,
            ethBalanceAsCurrencyValue,
            orders
        )
    );
  }, [
    ethBalanceAsCurrencyValue,
    btcBalanceAsCurrencyValue,
    daiBalanceAsCurrencyValue,
    orders
  ]);

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
