import {
  Box,
  Flex,
  Icon,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tooltip
} from '@chakra-ui/core';
import React from 'react';
import { RiCoinLine } from 'react-icons/all';
import {
  amountToUnitString,
  Currency,
  CurrencyValue,
  getCurrencyAndUnit
} from '../utils/currency';

export enum ColorMode {
  RED = 'RED',
  GREEN = 'GREEN',
  WHITE = 'WHITE',
  ORANGE = 'ORANGE',
  CYAN = 'CYAN',
  GRAY = 'GRAY'
}

interface CurrencyAmountProps {
  currencyValue: CurrencyValue;
  topText?: string;
  subText1?: string;
  subText2?: string;
  amountFontSize?: string;
  iconHeight?: string;
  colourMode?: ColorMode;
  noImage?: boolean;
  showCurrencyText?: boolean;
  minWidth?: string;
}

const currencyIcon = (currency: Currency, iconHeight?: string) => {
  let displayHeight = iconHeight;
  if (!displayHeight) {
    displayHeight = '1.5rem';
  }

  switch (currency) {
    case Currency.BTC:
      return (
        <Icon
          name="bitcoin"
          size={displayHeight}
          marginRight="0.5rem"
          alignSelf="center"
        />
      );
    case Currency.DAI:
      return (
        <Icon
          name="dai"
          size={displayHeight}
          marginRight="0.5rem"
          alignSelf="center"
        />
      );
    case Currency.ETH:
      return (
        <Icon
          name="ethereum"
          size={displayHeight}
          marginRight="0.5rem"
          alignSelf="center"
        />
      );
    default:
      return (
        <Box
          as={RiCoinLine}
          size={iconHeight}
          marginRight="0.5rem"
          alignSelf="center"
          color="gray"
        />
      );
  }
};

export default function CurrencyAmount({
  currencyValue,
  topText,
  subText1,
  subText2,
  amountFontSize,
  iconHeight,
  colourMode,
  noImage,
  showCurrencyText,
  minWidth
}: CurrencyAmountProps) {
  // TODO: Properly use the decimals instead of using the internal unit
  const { currency } = getCurrencyAndUnit(currencyValue);
  const displayAmount = amountToUnitString(currencyValue);

  let displayNumberColor;
  let displayTextColor;

  if (colourMode) {
    switch (colourMode) {
      case ColorMode.ORANGE:
        displayNumberColor = 'orange.800';
        displayTextColor = 'orange.600';
        break;
      case ColorMode.CYAN:
        displayNumberColor = 'cyan.800';
        displayTextColor = 'cyan.600';
        break;
      case ColorMode.GREEN:
        displayNumberColor = 'green.600';
        displayTextColor = 'green.600';
        break;
      case ColorMode.RED:
        displayNumberColor = 'red.600';
        displayTextColor = 'red.600';
        break;
      case ColorMode.WHITE:
        displayNumberColor = 'white';
        displayTextColor = 'white';
        break;
      case ColorMode.GRAY:
        displayNumberColor = 'gray.600';
        displayTextColor = 'gray.600';
        break;
      default:
        break;
    }
  }

  let displayMinWidth = '80px';
  if (minWidth) {
    displayMinWidth = minWidth;
  }

  const renderAmount = (
    <Flex direction="row">
      <Tooltip
        hasArrow
        aria-label={displayAmount}
        label={`${displayAmount} ${currency}`}
        placement="top"
      >
        <Flex
          direction="row"
          alignContent="center"
          minWidth={displayMinWidth}
          maxWidth="150px"
        >
          {noImage ? <></> : currencyIcon(currency, iconHeight)}
          {currencyValue.isLoading ? (
            <Spinner size="sm" />
          ) : (
            <StatNumber
              color={displayNumberColor}
              fontSize={amountFontSize}
              overflow="hidden"
              // @ts-ignore
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {displayAmount}
              {showCurrencyText && ` ${currency}`}
            </StatNumber>
          )}
        </Flex>
      </Tooltip>
    </Flex>
  );

  let renderTopText;
  let renderSubText1;
  let renderSubText2;

  if (topText) {
    renderTopText = (
      <StatLabel
        color={displayTextColor}
        minWidth="80px"
        overflow="hidden"
        // @ts-ignore
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {topText}
      </StatLabel>
    );
  }

  if (subText1) {
    renderSubText1 = (
      <StatHelpText
        color={displayTextColor}
        overflow="hidden"
        // @ts-ignore
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {subText1}
      </StatHelpText>
    );
  }

  if (subText2) {
    // TODO: Fix the hacky minus margin
    renderSubText2 = (
      <StatHelpText
        color={displayTextColor}
        marginTop="-10px"
        overflow="hidden"
        // @ts-ignore
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {subText2}
      </StatHelpText>
    );
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
