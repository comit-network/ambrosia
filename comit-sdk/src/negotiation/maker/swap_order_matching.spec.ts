import orderSwapMatch from "./swap_order_matching";

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

describe("negotiation.maker.Order", () => {
  it("Matches an order and a swap for native currencies", () => {
    const swapProps = {
      id: "abc",
      counterparty: "deadbeef",
      role: "Alice" as const,
      protocol: "foo",
      status: "IN_PROGRESS" as const,
      parameters: {
        alpha_asset: {
          name: "ether",
          quantity: "5000000000000000000"
        },
        alpha_ledger: {
          name: "ethereum",
          chain_id: 3
        },
        beta_asset: {
          name: "bitcoin",
          quantity: "1000000000"
        },
        beta_ledger: {
          name: "bitcoin",
          network: "testnet"
        }
      }
    };

    expect(orderSwapMatch(ethBtcOrder, swapProps)).toBeTruthy();
  });

  it("Matches an order and a swap for token currencies", () => {
    const swapProps = {
      id: "abc",
      counterparty: "deadbeef",
      role: "Alice" as const,
      protocol: "foo",
      status: "IN_PROGRESS" as const,
      parameters: {
        alpha_asset: {
          name: "erc20",
          token_contract: "0xB97048628DB6B661D4C2aA833e95Dbe1A905B280",
          quantity: "70000000000000000000"
        },
        alpha_ledger: {
          name: "ethereum",
          chain_id: 3
        },
        beta_asset: {
          name: "bitcoin",
          quantity: "1000000000"
        },
        beta_ledger: {
          name: "bitcoin",
          network: "testnet"
        }
      }
    };

    expect(orderSwapMatch(erc20BtcOrder, swapProps)).toBeTruthy();
  });

  it("Mismatches an order and a swap due to quantity discrepancy", () => {
    const swapProps = {
      id: "abc",
      counterparty: "deadbeef",
      role: "Alice" as const,
      protocol: "foo",
      status: "IN_PROGRESS" as const,
      parameters: {
        alpha_asset: {
          name: "ether",
          quantity: "500000000000"
        },
        alpha_ledger: {
          name: "ethereum",
          chain_id: 3
        },
        beta_asset: {
          name: "bitcoin",
          quantity: "1000000000"
        },
        beta_ledger: {
          name: "bitcoin",
          network: "testnet"
        }
      }
    };

    expect(orderSwapMatch(ethBtcOrder, swapProps)).toBeFalsy();
  });
});
