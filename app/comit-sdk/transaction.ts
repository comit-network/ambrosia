import { BitcoinWallet } from "./wallet/bitcoin";
import { EthereumWallet } from "./wallet/ethereum";

export enum TransactionStatus {
  /**
   * The transaction was rejected by the blockchain node.
   */
  Failed,
  /**
   * The transaction was not yet mined and its status is uncertain.
   */
  Pending,
  /**
   * The transaction was mined.
   */
  Confirmed,
  /**
   * The transaction could not be retrieved.
   */
  NotFound
}

/**
 * A handy interface to know the status of a blockchain transaction
 */
export class Transaction {
  constructor(
    private wallet: { ethereum?: EthereumWallet; bitcoin?: BitcoinWallet },
    public id: string
  ) {}

  /**
   * @param confirmations - Optional number of confirmations to wait for before returning.
   * @returns The transaction status by asking the blockchain.
   * @throws Ethereum: If the Receipt cannot be retrieved despite the transaction being mined.
   */
  public async status(confirmations?: number): Promise<TransactionStatus> {
    if (!!this.wallet.ethereum) {
      return this.ethereumStatus(confirmations);
    }
    if (!!this.wallet.bitcoin) {
      return this.bitcoinStatus(confirmations);
    }
    throw new Error("Wallet was not set");
  }

  private async ethereumStatus(
    confirmations?: number
  ): Promise<TransactionStatus> {
    const wallet = this.ethereumWallet;

    const transaction = await wallet.getTransaction(this.id);
    if (!transaction) {
      return TransactionStatus.NotFound;
    }

    async function checkReceipt(id: string): Promise<TransactionStatus> {
      const receipt = await wallet.getTransactionReceipt(id);
      if (!receipt) {
        throw new Error(
          `Could not retrieve receipt for ${id} on Ethereum despite ${transaction.confirmations} confirmations.`
        );
      }
      if (receipt.status === undefined || receipt.status === 0) {
        return TransactionStatus.Failed;
      }
      return TransactionStatus.Confirmed;
    }

    // Requested confirmations is undefined or 0 or already fulfilled
    if (!confirmations || confirmations <= transaction.confirmations) {
      if (transaction.confirmations === 0) {
        // If the transaction is not yet mined then its status is uncertain.
        return TransactionStatus.Pending;
      }
      return checkReceipt(this.id);
    } else {
      try {
        await transaction.wait(confirmations);
        return checkReceipt(this.id);
      } catch (e) {
        // Throws if the transaction is failed
        return TransactionStatus.Failed;
      }
    }
  }

  private async bitcoinStatus(
    confirmations?: number
  ): Promise<TransactionStatus> {
    try {
      if (!confirmations) {
        const transaction = await this.bitcoinWallet.getTransaction(this.id);
        if (transaction.confirmations === 0) {
          return TransactionStatus.Pending;
        }
        return TransactionStatus.Confirmed;
      } else {
        await this.bitcoinWallet.getTransactionWithConfirmations(
          this.id,
          confirmations
        );
        return TransactionStatus.Confirmed;
      }
    } catch (e) {
      return TransactionStatus.NotFound;
    }
  }

  private get bitcoinWallet(): BitcoinWallet {
    if (this.wallet.bitcoin) {
      return this.wallet.bitcoin;
    }
    throw new Error("This is not a Bitcoin Transaction.");
  }

  private get ethereumWallet(): EthereumWallet {
    if (this.wallet.ethereum) {
      return this.wallet.ethereum;
    }
    throw new Error("This is not an Ethereum Transaction.");
  }
}
