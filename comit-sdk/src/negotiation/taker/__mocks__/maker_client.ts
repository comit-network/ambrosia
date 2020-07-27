/**
 * @ignore
 * @packageDocumentation
 */
export const mockGetOrderByTradingPair = jest
  .fn()
  .mockImplementation((tradingPair: string) => {
    const words = tradingPair.split("-");

    return {
      id: "123",
      validUntil: 1234567890,
      ask: {
        ledger: words[0],
        asset: words[1],
        nominalAmount: "123"
      },
      bid: {
        ledger: words[2],
        asset: words[3],
        nominalAmount: "4567890"
      }
    };
  });

export const mockGetExecutionParams = jest.fn().mockImplementation(() => {
  return {
    peer: {
      peer_id: "12345",
      address_hint: "/ip4/0.0.0.0"
    },
    alpha_expiry: 123456780,
    beta_expiry: 123456700,
    ledgers: { bitcoin: { network: "regtest" }, ethereum: { chain_id: 17 } }
  };
});

export const mockTakeOrder = jest.fn().mockImplementation(() => {
  // The mocked function returns Promise of type void
});

export const MakerClient = jest.fn().mockImplementation(() => {
  return {
    getOrderByTradingPair: mockGetOrderByTradingPair,
    getExecutionParams: mockGetExecutionParams,
    takeOrder: mockTakeOrder
  };
});
