import { Book } from '../utils/book';
import useDaiBalance from './useDaiBalance';
import useEtherBalance from './useEtherBalance';
import useOrders from './useOrders';
import useBitcoinBalance from './useBitcoinBalance';
import { calculateQuote, CurrencyValue, ETH_FEE } from '../utils/currency';
import { Order } from '../utils/order';
import { ethers } from 'ethers';

export function intoBook(
  btcBalance: CurrencyValue,
  daiBalance: CurrencyValue,
  ethBalance: CurrencyValue,
  orders: Order[]
): Book {
  const sumOfBtcInOrdersBigNumber = orders
    .filter(order => order.position === 'sell')
    .reduce((a, b) => {
      const quantity = ethers.BigNumber.from(b.quantity.value);
      return a.add(quantity);
    }, ethers.BigNumber.from(0));

  const myBuyOrders = orders.filter(order => order.position === 'buy');

  // The sum of DAI in orders is the amount of DAI in buy orders (buying BTC = selling DAI), defined by price and quantity
  const sumOfDaiInOrdersBigNumber = myBuyOrders.reduce((a, b) => {
    const quoteCurrencyVal = calculateQuote(b.price, b.quantity);
    const quote = ethers.BigNumber.from(quoteCurrencyVal.value);
    return a.add(quote);
  }, ethers.BigNumber.from(0));

  const numberOfBuyOrders = ethers.BigNumber.from(myBuyOrders.length);
  const sumOfEthInOrderFeesBigNumber = ETH_FEE.mul(numberOfBuyOrders);

  const btcBalanceBigNumber = ethers.BigNumber.from(btcBalance.value);
  const daiBalanceBigNumber = ethers.BigNumber.from(daiBalance.value);
  const ethBalanceBigNumber = ethers.BigNumber.from(ethBalance.value);

  const availableBtcBigNumber = btcBalanceBigNumber.sub(
    sumOfBtcInOrdersBigNumber
  );
  const availableDaiBigNumber = daiBalanceBigNumber.sub(
    sumOfDaiInOrdersBigNumber
  );
  const availableEthBigNumber = ethBalanceBigNumber.sub(
    sumOfEthInOrderFeesBigNumber
  );

  return {
    btcTotal: btcBalance,
    daiTotal: daiBalance,
    ethTotal: ethBalance,

    btcInOrders: {
      currency: btcBalance.currency,
      value: sumOfBtcInOrdersBigNumber.toString(),
      decimals: btcBalance.decimals,
      isLoading: btcBalance.isLoading
    },
    daiInOrders: {
      currency: daiBalance.currency,
      value: sumOfDaiInOrdersBigNumber.toString(),
      decimals: daiBalance.decimals,
      isLoading: daiBalance.isLoading
    },
    ethInOrders: {
      currency: ethBalance.currency,
      value: sumOfEthInOrderFeesBigNumber.toString(),
      decimals: ethBalance.decimals,
      isLoading: ethBalance.isLoading
    },

    btcAvailableForTrading: {
      currency: btcBalance.currency,
      value: availableBtcBigNumber.toString(),
      decimals: btcBalance.decimals,
      isLoading: btcBalance.isLoading
    },
    daiAvailableForTrading: {
      currency: daiBalance.currency,
      value: availableDaiBigNumber.toString(),
      decimals: daiBalance.decimals,
      isLoading: daiBalance.isLoading
    },
    ethAvailableForTrading: {
      currency: ethBalance.currency,
      value: availableEthBigNumber.toString(),
      decimals: ethBalance.decimals,
      isLoading: ethBalance.isLoading
    }
  };
}

export default function useBook() {
  const orders = useOrders();
  const bitcoinBalance = useBitcoinBalance();
  const daiBalance = useDaiBalance();
  const etherBalance = useEtherBalance();

  return intoBook(bitcoinBalance, daiBalance, etherBalance, orders);
}
