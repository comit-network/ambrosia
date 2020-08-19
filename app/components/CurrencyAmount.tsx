import {
  Box,
  Flex,
  Image,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tooltip
} from '@chakra-ui/core';
import React from 'react';
import { toBitcoin } from 'satoshi-bitcoin-ts';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import { RiCoinLine } from 'react-icons/all';
import BitcoinIcon from '../assets/Bitcoin.svg';
import DaiIcon from '../assets/Dai.svg';
import EthereumIcon from '../assets/Ethereum.svg';

export enum Currency {
  BTC = 'BTC',
  DAI = 'DAI',
  ETH = 'ETH'
}

export enum CurrencyUnit {
  BTC,
  SATOSHI,
  DAI,
  ATTO,
  ETHER,
  WEI
}

interface CurrencyAmountProps {
  amount: string | number;
  currency: Currency;
  unit: CurrencyUnit;
  topText?: string;
  subText1?: string;
  subText2?: string;
  amountShortenPosition?: number;
  amountFontSize?: string;
  iconHeight?: string;
}

const currencyIcon = (currency: Currency, iconHeight?: string) => {
  let displayHeight = iconHeight;
  if (!displayHeight) {
    displayHeight = '1.5rem';
  }

  switch (currency) {
    case Currency.BTC:
      return (
        <Image
          src={BitcoinIcon}
          height={displayHeight}
          marginRight="0.5rem"
          alignSelf="center"
        />
      );
    case Currency.DAI:
      return (
        <Image
          src={DaiIcon}
          height={displayHeight}
          marginRight="0.5rem"
          alignSelf="center"
        />
      );
    case Currency.ETH:
      return (
        <Image
          src={EthereumIcon}
          height={displayHeight}
          marginRight="0.5rem"
          alignSelf="center"
        />
      );
    default:
      return (
        <Box
          as={RiCoinLine}
          height={iconHeight}
          marginRight="0.5rem"
          alignSelf="center"
          color="gray"
        />
      );
  }
};

export function amountToUnitString(
  amount: number | string,
  unit: CurrencyUnit
) {
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

export function shortenAmountString(
  amountString: string,
  amountShortenPosition?: number
) {
  let displayAmount = amountString;
  if (amountShortenPosition) {
    const decimalPointPosition = displayAmount.indexOf('.');
    if (amountShortenPosition < decimalPointPosition + 3) {
      displayAmount = `${displayAmount.substring(
        0,
        decimalPointPosition + 3
      )}...`;
    } else {
      displayAmount =
        displayAmount.length > amountShortenPosition + 3
          ? `${displayAmount.substring(0, amountShortenPosition)}...`
          : displayAmount;
    }
  }
  return displayAmount;
}

export default function CurrencyAmount({
  amount,
  currency,
  unit,
  topText,
  subText1,
  subText2,
  amountShortenPosition,
  amountFontSize,
  iconHeight
}: CurrencyAmountProps) {
  const unshortenedDisplayAmount = amountToUnitString(amount, unit);
  const displayAmount = shortenAmountString(
    unshortenedDisplayAmount,
    amountShortenPosition
  );

  const renderAmount = (
    <Flex direction="row">
      <Tooltip
        hasArrow
        aria-label={unshortenedDisplayAmount}
        label={`${unshortenedDisplayAmount} ${currency}`}
        placement="top"
      >
        <Flex direction="row" alignContent="center">
          {currencyIcon(currency, iconHeight)}
          <StatNumber fontSize={amountFontSize}>{displayAmount}</StatNumber>
        </Flex>
      </Tooltip>
    </Flex>
  );

  let renderTopText;
  let renderSubText1;
  let renderSubText2;

  if (topText) {
    renderTopText = <StatLabel minWidth="80px">{topText}</StatLabel>;
  }

  if (subText1) {
    renderSubText1 = <StatHelpText>{subText1}</StatHelpText>;
  }

  if (subText2) {
    // TODO: Fix the hacky minus margin
    renderSubText2 = <StatHelpText marginTop="-10px">{subText2}</StatHelpText>;
  }

  return (
    <Stat>
      {renderTopText}
      {renderAmount}
      {renderSubText1}
      {renderSubText2}
    </Stat>
  );
}
