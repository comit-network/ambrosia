import { BigNumber } from "bignumber.js";
import { getToken } from "../tokens/tokens";
import { fromNominal, isNative, isOrderValid } from "./order";

const ethBtcOrder = {
  tradingPair: "ETH-BTC",
  id: "123",
  validUntil: 123456,
  bid: {
    ledger: "bitcoin",
    asset: "bitcoin",
    nominalAmount: "10"
  },
  ask: {
    ledger: "ethereum",
    asset: "ether",
    nominalAmount: "5"
  }
};

const erc20BtcOrder = {
  tradingPair: "PAY-BTC",
  id: "123",
  validUntil: 123456,
  bid: {
    ledger: "bitcoin",
    asset: "bitcoin",
    nominalAmount: "10"
  },
  ask: {
    ledger: "ethereum",
    asset: "PAY",
    nominalAmount: "70"
  }
};

describe("negotiation.Order", () => {
  it("Bitcoin & Ether are native", () => {
    expect(isNative(ethBtcOrder.ask)).toBeTruthy();
    expect(isNative(ethBtcOrder.bid)).toBeTruthy();
  });

  it("ERC20 token is not native", () => {
    expect(isNative(erc20BtcOrder.ask)).toBeFalsy();
  });

  it("should be able to convert float Bitcoin", () => {
    const converted = fromNominal("bitcoin", "0.1");
    const expected = new BigNumber("10000000");
    expect(converted).toStrictEqual(expected);
  });

  it("should be able to convert integer Bitcoin", () => {
    const converted = fromNominal("bitcoin", "100");
    const expected = new BigNumber("10000000000");
    expect(converted).toStrictEqual(expected);
  });

  it("should be able to convert float Ether", () => {
    const converted = fromNominal("ether", "0.1");
    const expected = new BigNumber("100000000000000000");
    expect(converted).toStrictEqual(expected);
  });

  it("should be able to convert integer Ether", () => {
    const converted = fromNominal("ether", "100");
    const expected = new BigNumber("100000000000000000000");
    expect(converted).toStrictEqual(expected);
  });

  it("should be able to convert float ERC20 Token", () => {
    const token = getToken("PAY");
    const converted = fromNominal("PAY", "0.1", token);
    const expected = new BigNumber("100000000000000000");
    expect(converted).toStrictEqual(expected);
  });

  it("should be able to convert ERC20 Token", () => {
    const token = getToken("PAY");
    const converted = fromNominal("PAY", "100", token);
    const expected = new BigNumber("100000000000000000000");
    expect(converted).toStrictEqual(expected);
  });

  it("is not valid if amounts do not represent a number", () => {
    const rawOrder = {
      tradingPair: "ETH-BTC",
      id: "1234",
      validUntil: 1234567890,
      bid: {
        ledger: "bitcoin",
        asset: "bitcoin",
        nominalAmount: "this is not a number"
      },
      ask: {
        ledger: "ethereum",
        asset: "ether",
        nominalAmount: "99"
      }
    };

    expect(isOrderValid(rawOrder)).toBeFalsy();
  });
});
