import { ethers } from 'ethers';
import { toBitcoin } from 'satoshi-bitcoin-ts';
import { formatEther, formatUnits } from 'ethers/lib/utils';

// TODO Deal with this in a more elaborate way, potentially use the COMIT sdk
export const ETH_FEE = ethers.BigNumber.from(420000000000000); // 21000 units of gas in wei (rough)
// TODO: Validate and potentially do in more elaborate way
// ~265 vbytes (2 inputs 2 outputs segwit transaction)
// * 35 sat/vbytes (Looking at https://bitcoinfees.github.io/#1m)
export const BTC_FEE = ethers.BigNumber.from(8960);
export const MIN_BTC = ethers.BigNumber.from(0);
export const MIN_DAI = ethers.BigNumber.from(0);

// export const BTC_SYMBOL = String.fromCharCode(0x20bf);
// export const DAI_SYMBOL = String.fromCharCode(0x25c8);
// export const ETH_SYMBOL = String.fromCharCode(0x039e);

export const BTC_DEC = 8;
export const DAI_DEC = 18;
export const ETH_DEC = 18;
export const SAT_DEC_ADJUST = 100000000;

// TODO: Remove once we deal with decimals instead
export enum Currency {
  BTC = 'BTC',
  DAI = 'DAI',
  ETH = 'ETH'
}

export const ZERO_DAI: CurrencyValue = {
  currency: Currency.DAI,
  value: '0',
  decimals: DAI_DEC
};

export const ZERO_BTC: CurrencyValue = {
  currency: Currency.BTC,
  value: '0',
  decimals: BTC_DEC
};

export const ZERO_ETH: CurrencyValue = {
  currency: Currency.ETH,
  value: '0',
  decimals: ETH_DEC
};

// TODO: Remove once we deal with decimals instead
export enum CurrencyUnit {
  BTC,
  SATOSHI,
  DAI,
  ATTO,
  ETHER,
  WEI
}

export interface CurrencyValue {
  currency: string;
  value: string;
  decimals: number;
}

export function calculateQuote(
  price: CurrencyValue,
  quantity: CurrencyValue
): CurrencyValue {
  const satToAttoZeros = ethers.BigNumber.from(SAT_DEC_ADJUST);

  // Calc with sat as base
  const priceWei = ethers.BigNumber.from(price.value); // Price in DAI(wei) for 1 BTC
  const quantitySat = ethers.BigNumber.from(quantity.value); // Quantity in BTC(sat)

  // multiply first so the division does not lose precision
  const quoteUnadjusted = priceWei.mul(quantitySat);
  const quote = quoteUnadjusted.div(satToAttoZeros);

  return {
    currency: Currency.DAI,
    value: quote.toString(),
    decimals: 18
  };
}

export function calculateBaseFromAvailableQuote(
  price: CurrencyValue,
  quote: CurrencyValue
): CurrencyValue {
  const satDecimals = ethers.BigNumber.from(SAT_DEC_ADJUST);

  // Calc with sat as base
  const priceWei = ethers.BigNumber.from(price.value); // Price in DAI(wei) for 1 BTC
  const quoteWei = ethers.BigNumber.from(quote.value); // Amount of DAI to calculate the base for

  if (priceWei.eq(ethers.BigNumber.from(0))) {
    return ZERO_BTC;
  }

  // multiply first so the division does not lose precision
  const quoteAdjusted = quoteWei.mul(satDecimals);
  const quantity = quoteAdjusted.div(priceWei);

  return {
    currency: Currency.BTC,
    value: quantity.toString(),
    decimals: 8
  };
}

interface CurrencyAndUnit {
  currency: Currency;
  unit: CurrencyUnit;
}

// TODO: Refactor to just use CurrencyValue decimals and the currency label
export function getCurrencyAndUnit(
  currencyValue: CurrencyValue
): CurrencyAndUnit {
  let unit = CurrencyUnit.SATOSHI;
  let currency = Currency.BTC;

  if (currencyValue.currency === 'BTC') {
    currency = Currency.BTC;
    if (currencyValue.decimals === 8) {
      unit = CurrencyUnit.SATOSHI;
    } else {
      unit = CurrencyUnit.BTC;
    }
  } else if (currencyValue.currency === 'DAI') {
    currency = Currency.DAI;
    if (currencyValue.decimals === 18) {
      unit = CurrencyUnit.ATTO;
    } else {
      unit = CurrencyUnit.DAI;
    }
  } else if (currencyValue.currency === 'ETH') {
    currency = Currency.ETH;
    if (currencyValue.decimals === 18) {
      unit = CurrencyUnit.WEI;
    } else {
      unit = CurrencyUnit.ETHER;
    }
  }

  return {
    currency,
    unit
  };
}

export function amountToUnitString(currencyValue: CurrencyValue) {
  const amount = currencyValue.value;
  const { unit } = getCurrencyAndUnit(currencyValue);

  if (!amount) {
    return 'loading...';
  }

  switch (unit) {
    case CurrencyUnit.BTC:
    case CurrencyUnit.DAI:
    case CurrencyUnit.ETHER: {
      return amount.toString();
    }
    case CurrencyUnit.SATOSHI: {
      return toBitcoin(amount).toString();
    }
    case CurrencyUnit.WEI: {
      return formatEther(amount).toString();
    }
    case CurrencyUnit.ATTO: {
      return formatUnits(amount).toString();
    }
    default: {
      return amount.toString();
    }
  }
}

export function daiIntoCurVal(
  dai: string | number | ethers.BigNumber
): CurrencyValue {
  let bigNr = dai;
  if (!(bigNr instanceof ethers.BigNumber)) {
    bigNr = ethers.utils.parseUnits(dai.toString(), DAI_DEC);
  }

  const curVal: CurrencyValue = {
    currency: Currency.DAI,
    value: bigNr.toString(),
    decimals: DAI_DEC
  };

  return curVal;
}

export function btcIntoCurVal(
  btc: string | number | ethers.BigNumber
): CurrencyValue {
  let bigNr = btc;
  if (!(bigNr instanceof ethers.BigNumber)) {
    bigNr = ethers.utils.parseUnits(btc.toString(), BTC_DEC);
  }

  const curVal: CurrencyValue = {
    currency: Currency.BTC,
    value: bigNr.toString(),
    decimals: BTC_DEC
  };

  return curVal;
}

export function ethIntoCurVal(
  eth: string | number | ethers.BigNumber
): CurrencyValue {
  let bigNr = eth;
  if (!(bigNr instanceof ethers.BigNumber)) {
    bigNr = ethers.utils.parseUnits(eth.toString(), ETH_DEC);
  }

  const curVal: CurrencyValue = {
    currency: Currency.ETH,
    value: bigNr.toString(),
    decimals: ETH_DEC
  };

  return curVal;
}
