import { Order } from './order';
import { ethers } from 'ethers';
import { calculateQuote, CurrencyValue, ETH_FEE } from './currency';

export interface Book {
  btcTotal: CurrencyValue;
  daiTotal: CurrencyValue;
  ethTotal: CurrencyValue;

  btcInOrders: CurrencyValue;
  daiInOrders: CurrencyValue;
  ethInOrders: CurrencyValue;

  // available = total - inOrders
  btcAvailableForTrading: CurrencyValue;
  daiAvailableForTrading: CurrencyValue;
  ethAvailableForTrading: CurrencyValue;
}

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

  const numberOfbuyOrders = ethers.BigNumber.from(myBuyOrders.length);
  const sumOfEthInOrderFeesBigNumber = ETH_FEE.mul(numberOfbuyOrders);

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
      decimals: btcBalance.decimals
    },
    daiInOrders: {
      currency: daiBalance.currency,
      value: sumOfDaiInOrdersBigNumber.toString(),
      decimals: daiBalance.decimals
    },
    ethInOrders: {
      currency: ethBalance.currency,
      value: sumOfEthInOrderFeesBigNumber.toString(),
      decimals: ethBalance.decimals
    },

    btcAvailableForTrading: {
      currency: btcBalance.currency,
      value: availableBtcBigNumber.toString(),
      decimals: btcBalance.decimals
    },
    daiAvailableForTrading: {
      currency: daiBalance.currency,
      value: availableDaiBigNumber.toString(),
      decimals: daiBalance.decimals
    },
    ethAvailableForTrading: {
      currency: ethBalance.currency,
      value: availableEthBigNumber.toString(),
      decimals: ethBalance.decimals
    }
  };
}
