import { Asset } from "../..";
import { OrderAsset } from "../order";
import {
  assetOrderToSwap,
  MatchingCriteria,
  rateMatches,
  TakerOrder
} from "./order";

const defaultOrderParams = {
  tradingPair: "ETH-BTC",
  id: "1234",
  validUntil: 1234567890,
  bid: {
    ledger: "bitcoin",
    asset: "bitcoin",
    nominalAmount: "1.1"
  },
  ask: {
    ledger: "ethereum",
    asset: "ether",
    nominalAmount: "99"
  }
};

const defaultMatchingCriteria = {
  buy: {
    asset: "bitcoin",
    ledger: "bitcoin"
  },
  sell: {
    asset: "ether",
    ledger: "ethereum"
  }
};

describe("negotiation.taker.Order", () => {
  it("Builds Bitcoin swap asset from order asset", () => {
    const orderAsset: OrderAsset = {
      ledger: "bitcoin",
      asset: "bitcoin",
      nominalAmount: "10"
    };
    const expectedSwapAsset: Asset = {
      name: "bitcoin",
      quantity: "1000000000"
    };
    const actualSwapAsset = assetOrderToSwap(orderAsset);
    expect(actualSwapAsset).toStrictEqual(expectedSwapAsset);
  });

  it("Builds Ether swap asset from order asset", () => {
    const orderAsset: OrderAsset = {
      ledger: "ethereum",
      asset: "ether",
      nominalAmount: "42"
    };
    const expectedSwapAsset: Asset = {
      name: "ether",
      quantity: "42000000000000000000"
    };
    const actualSwapAsset = assetOrderToSwap(orderAsset);
    expect(actualSwapAsset).toStrictEqual(expectedSwapAsset);
  });

  it("Builds ERC20 swap asset from order asset", () => {
    const orderAsset: OrderAsset = {
      ledger: "ethereum",
      asset: "PAY",
      nominalAmount: "123"
    };
    const expectedSwapAsset: Asset = {
      name: "erc20",
      token_contract: "0xB97048628DB6B661D4C2aA833e95Dbe1A905B280",
      quantity: "123000000000000000000"
    };
    const actualSwapAsset = assetOrderToSwap(orderAsset);
    expect(actualSwapAsset).toStrictEqual(expectedSwapAsset);
  });

  it("matches taker criteria", () => {
    const order = new TakerOrder(
      defaultOrderParams,
      defaultMatchingCriteria,
      () => Promise.resolve(undefined)
    );

    expect(order.matches()).toBeTruthy();
  });

  it("doesnt match taker criteria due to incorrect asset", () => {
    const rawOrder = {
      tradingPair: "ETH-BTC",
      id: "1234",
      validUntil: 1234567890,
      bid: {
        ledger: "bitcoin",
        asset: "bitcoin",
        nominalAmount: "1.1"
      },
      ask: {
        ledger: "ethereum",
        asset: "PAY",
        nominalAmount: "99"
      }
    };

    const order = new TakerOrder(rawOrder, defaultMatchingCriteria, () =>
      Promise.resolve(undefined)
    );

    expect(order.matches()).toBeFalsy();
  });

  it("doesnt match taker criteria if buy order amount is too low", () => {
    const matchingCriteria = {
      buy: {
        asset: "bitcoin",
        ledger: "bitcoin",
        minNominalAmount: "2"
      },
      sell: {
        asset: "ether",
        ledger: "ethereum"
      }
    };
    const order = new TakerOrder(defaultOrderParams, matchingCriteria, () =>
      Promise.resolve(undefined)
    );

    expect(order.matches()).toBeFalsy();
  });

  it("is valid", () => {
    const order = new TakerOrder(
      defaultOrderParams,
      defaultMatchingCriteria,
      () => Promise.resolve(undefined)
    );

    expect(order.isValid()).toBeTruthy();
  });

  it("doesnt take order if it is not valid", async () => {
    const order = new TakerOrder(
      defaultOrderParams,
      defaultMatchingCriteria,
      () => {
        throw new Error("Test fail, order should not be taken");
      }
    );

    order.isValid = () => {
      return false;
    };

    await order.take();
  });
});

describe("Rate matching", () => {
  it("Does match if min rate is not set", () => {
    const criteria: MatchingCriteria = JSON.parse(
      JSON.stringify(defaultMatchingCriteria)
    );

    expect(rateMatches(criteria, defaultOrderParams)).toBeTruthy();
  });

  it("Does match if rate is more than min rate", () => {
    const criteria: MatchingCriteria = JSON.parse(
      JSON.stringify(defaultMatchingCriteria)
    );
    criteria.minRate = 0.01;
    expect(rateMatches(criteria, defaultOrderParams)).toBeTruthy();
  });

  it("Does not match if rate is less than min rate", () => {
    const criteria: MatchingCriteria = JSON.parse(
      JSON.stringify(defaultMatchingCriteria)
    );
    criteria.minRate = 0.02;
    expect(rateMatches(criteria, defaultOrderParams)).toBeFalsy();
  });
});
