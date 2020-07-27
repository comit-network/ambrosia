import { SwapSubEntity } from "./cnd/rfc003_payload";
import { isOngoing } from "./comit_client";

function defaultSwap(): SwapSubEntity {
  return {
    rel: ["self"],
    properties: {
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
    }
  };
}

describe("comitClient", () => {
  it("Swapped swap is not ongoing", () => {
    const swap = defaultSwap();
    swap.properties!.status = "SWAPPED";
    expect(isOngoing(swap)).toBeFalsy();
  });

  it("[Bob] Swap freshly accepted by Bob is ongoing", () => {
    const swap = defaultSwap();
    swap.properties!.role = "Bob";
    expect(isOngoing(swap)).toBeTruthy();
  });

  it("[Alice] Swap freshly accepted by Bob is ongoing", () => {
    const swap = defaultSwap();
    swap.properties!.role = "Bob";
    swap.actions = [
      {
        name: "fund",
        href: "/fund"
      }
    ];
    expect(isOngoing(swap)).toBeTruthy();
  });

  it("[Bob] Swap yet to be accepted by Bob is not ongoing", () => {
    const swap = defaultSwap();
    swap.properties!.role = "Bob";
    swap.actions = [
      {
        name: "accept",
        href: "/accept"
      },
      {
        name: "decline",
        href: "/decline"
      }
    ];
    expect(isOngoing(swap)).toBeFalsy();
  });

  it("[Alice] Swap yet to be accepted by Bob is not ongoing", () => {
    const swap = defaultSwap();
    expect(isOngoing(swap)).toBeFalsy();
  });
});
