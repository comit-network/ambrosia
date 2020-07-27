import { Problem } from "./cnd/axios_rfc7807_middleware";
import { Cnd } from "./cnd/cnd";
import { Swap, WalletError } from "./swap";

describe("Swap", () => {
  it("Throws a problem if cnd returns an error when executing an action", async () => {
    const basePath = "http://example.com";
    const cnd = new Cnd(basePath);

    const selfPath = "/swap-id";

    const swap = new Swap(cnd, selfPath, {});

    cnd.fetch = jest.fn(async () => {
      throw new Problem({ title: "" });
    });

    const promise = swap.tryExecuteSirenAction("action", {
      maxTimeoutSecs: 1,
      tryIntervalSecs: 0.01
    });

    await expect(promise).rejects.toBeInstanceOf(Problem);
  });

  it("Throws a WalletError if a wallet returns an error when resolving fields", async () => {
    const basePath = "http://example.com";
    const cnd = new Cnd(basePath);

    const swap = new Swap(cnd, `${basePath}/swap-id`, {});

    // @ts-ignore: This should return an AxiosPromise
    cnd.fetch = jest.fn(async () => {
      return {
        data: {
          actions: [
            {
              href: "/swap-id/action",
              name: "action",
              method: "GET",
              fields: [{ name: "address", class: ["bitcoin", "address"] }]
            }
          ]
        }
      };
    });

    const promise = swap.tryExecuteSirenAction("action", {
      maxTimeoutSecs: 1,
      tryIntervalSecs: 0.01
    });

    await expect(promise).rejects.toBeInstanceOf(WalletError);
  });

  it("Throws a WalletError if a wallet returns an error when executing an action", async () => {
    const basePath = "http://example.com";
    const cnd = new Cnd(basePath);

    const swap = new Swap(cnd, `${basePath}/swap-id`, {});

    // @ts-ignore: This should return an AxiosPromise
    cnd.fetch = jest.fn(async () => {
      return {
        data: {
          actions: [
            {
              href: "/swap-id/deploy",
              name: "deploy",
              method: "GET"
            }
          ]
        }
      };
    });

    // @ts-ignore: This should return an AxiosPromise
    cnd.executeSirenAction = jest.fn(async () => {
      return {
        data: {
          type: "ethereum-deploy-contract",
          payload: {
            data: "",
            amount: "",
            gas_limit: "",
            network: ""
          }
        }
      };
    });

    const tryParams = {
      maxTimeoutSecs: 1,
      tryIntervalSecs: 0.01
    };

    const promise = swap.deploy(tryParams);

    await expect(promise).rejects.toBeInstanceOf(WalletError);
  });
});
