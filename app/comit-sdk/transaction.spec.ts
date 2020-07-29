import { Transaction, TransactionStatus } from "./transaction";
import { MockBitcoinWallet } from "./wallet/__mocks__/bitcoin";
import { EthereumWallet } from "./wallet/ethereum";

const defaultEthereumWallet = new EthereumWallet("");

const defaultBitcoinWallet = new MockBitcoinWallet();

describe("Transaction", () => {
  it("returns failed for a failed Ethereum transaction", async () => {
    const transaction = new Transaction(
      { ethereum: defaultEthereumWallet },
      ""
    );

    defaultEthereumWallet.getTransaction = jest.fn().mockImplementation(() => {
      return {
        confirmations: 1
      };
    });

    defaultEthereumWallet.getTransactionReceipt = jest
      .fn()
      .mockImplementation(() => {
        return {
          status: 0
        };
      });

    const status = await transaction.status();

    expect(status).toEqual(TransactionStatus.Failed);
  });

  it("returns pending for an unconfirmed Ethereum transaction", async () => {
    const transaction = new Transaction(
      { ethereum: defaultEthereumWallet },
      ""
    );

    defaultEthereumWallet.getTransaction = jest.fn().mockImplementation(() => {
      return {
        confirmations: 0
      };
    });

    const status = await transaction.status();

    expect(status).toEqual(TransactionStatus.Pending);
  });

  it("returns confirmed for a mined Ethereum transaction", async () => {
    const transaction = new Transaction(
      { ethereum: defaultEthereumWallet },
      ""
    );

    defaultEthereumWallet.getTransaction = jest.fn().mockImplementation(() => {
      return {
        confirmations: 1
      };
    });

    defaultEthereumWallet.getTransactionReceipt = jest
      .fn()
      .mockImplementation(() => {
        return {
          status: 1
        };
      });

    const status = await transaction.status();

    expect(status).toEqual(TransactionStatus.Confirmed);
  });

  it("returns pending for a Bitcoin transaction with 0 confirmations", async () => {
    const transaction = new Transaction({ bitcoin: defaultBitcoinWallet }, "");

    defaultBitcoinWallet.getTransaction = jest.fn().mockImplementation(() => {
      return {
        confirmations: 0
      };
    });

    const status = await transaction.status();

    expect(status).toEqual(TransactionStatus.Pending);
  });

  it("returns confirmed for a Bitcoin transaction with 1 confirmation", async () => {
    const transaction = new Transaction({ bitcoin: defaultBitcoinWallet }, "");

    defaultBitcoinWallet.getTransaction = jest.fn().mockImplementation(() => {
      return {
        confirmations: 1
      };
    });

    const status = await transaction.status();

    expect(status).toEqual(TransactionStatus.Confirmed);
  });

  it("returns confirmed for a Bitcoin transaction with 2 confirmations when asking 2 confirmations", async () => {
    const transaction = new Transaction({ bitcoin: defaultBitcoinWallet }, "");

    defaultBitcoinWallet.getTransactionWithConfirmations = jest
      .fn()
      .mockImplementation(() => {
        return {
          confirmations: 2
        };
      });

    const status = await transaction.status(2);

    expect(status).toEqual(TransactionStatus.Confirmed);
  });
});
