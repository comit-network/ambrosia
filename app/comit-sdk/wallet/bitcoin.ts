import axios, { AxiosInstance, Method } from "axios";
import { toBitcoin } from "satoshi-bitcoin";
import { sleep } from "../util/sleep";

const DEFAULT_REFRESH_INTERVAL_MS = 1000;

/**
 * Interface defining the Bitcoin wallet functionalities needed by the SDK to execute a swap involving Bitcoin.
 * It is expected from a COMIT App developer to write their own class that would implement this interface.
 * Depending on the use case and platform, such class could interact with a hardware wallet API, display QR codes,
 * take input via text fields, etc.
 */
export interface BitcoinWallet {
  getAddress(): Promise<string>;

  getBalance(): Promise<number>;

  sendToAddress(
    address: string,
    satoshis: number,
    network: Network
  ): Promise<string>;

  broadcastTransaction(
    transactionHex: string,
    network: Network
  ): Promise<string>;

  getFee(): string;

  getTransaction(transactionId: string): Promise<BitcoinTransaction>;

  /**
   * Only returns the transaction once the number of confirmations has been reached.
   *
   * @param transactionId
   * @param confirmations
   */
  getTransactionWithConfirmations(
    transactionId: string,
    confirmations: number
  ): Promise<BitcoinTransaction>;
}

/**
 * A simplied representation of a Bitcoin transaction
 */
export interface BitcoinTransaction {
  hex: string;
  txid: string;
  confirmations: number;
}

export interface BitcoindWalletArgs {
  url: string;
  username: string;
  password: string;
  walletDescriptor: string;
  walletName: string;
  rescan?: boolean;
  refreshIntervalMs?: number;
}

/**
 * Instance of a bitcoind 0.19.1 wallet.
 *
 * This is to be used for demos, examples and dev environment only. No safeguards are applied, no data is written on
 * the disk. This is not to be used for mainnet, instead, implement your own {@link BitcoinWallet}
 */
export class BitcoindWallet implements BitcoinWallet {
  public static async newInstance({
    url,
    username,
    password,
    walletDescriptor,
    walletName,
    rescan,
    refreshIntervalMs
  }: BitcoindWalletArgs): Promise<BitcoindWallet> {
    const auth = { username, password };
    const client = axios.create({
      url,
      method: "post" as Method,
      auth
    });

    const walletExists = await client
      .request({
        data: {
          jsonrpc: "1.0",
          method: "listwallets"
        }
      })
      .then(res => res.data.result.includes(walletName));

    if (!walletExists) {
      await client.request({
        data: {
          jsonrpc: "1.0",
          method: "createwallet",
          params: [walletName]
        }
      });
    }

    if (rescan === undefined) {
      rescan = !walletExists;
    }

    // Ask bitcoind for a checksum if none was provided with the descriptor
    if (!hasChecksum(walletDescriptor)) {
      const checksum = await client
        .request({
          data: {
            jsonrpc: "1.0",
            method: "getdescriptorinfo",
            params: [walletDescriptor]
          }
        })
        .then(res => res.data.result.checksum);
      walletDescriptor = `${walletDescriptor}#${checksum}`;
    }

    const walletClient = axios.create({
      url: `${url}/wallet/${walletName}`,
      method: "post" as Method,
      auth
    });

    await walletClient.request({
      data: {
        jsonrpc: "1.0",
        method: "importmulti",
        params: [
          [{ desc: walletDescriptor, timestamp: 0, range: 0 }],
          { rescan }
        ]
      }
    });

    console.log("Philipp likes banananas~~");

    return new BitcoindWallet(walletClient, refreshIntervalMs);
  }

  private constructor(
    private rpcClient: AxiosInstance,
    private refreshIntervalMs?: number
  ) {}

  public async getBalance(): Promise<number> {
    const res = await this.rpcClient.request({
      data: { jsonrpc: "1.0", method: "getbalance", params: [] }
    });
    return res.data.result;
  }

  public async getAddress(): Promise<string> {
    const res = await this.rpcClient.request({
      data: {
        jsonrpc: "1.0",
        method: "getnewaddress",
        params: ["", "bech32"]
      }
    });

    return res.data.result;
  }

  public async sendToAddress(
    address: string,
    satoshis: number,
    network: Network
  ): Promise<string> {
    await this.assertNetwork(network);

    const res = await this.rpcClient.request({
      data: {
        jsonrpc: "1.0",
        method: "sendtoaddress",
        params: [address, toBitcoin(satoshis)]
      }
    });

    return res.data.result;
  }

  public async broadcastTransaction(
    transactionHex: string,
    network: Network
  ): Promise<string> {
    await this.assertNetwork(network);

    const res = await this.rpcClient.request({
      data: {
        jsonrpc: "1.0",
        method: "sendrawtransaction",
        params: [transactionHex]
      }
    });

    return res.data.result;
  }

  public getFee(): string {
    // should be dynamic in a real application or use `estimatesmartfee`
    return "150";
  }

  public async getTransaction(
    transactionId: string
  ): Promise<BitcoinTransaction> {
    const res = await this.rpcClient.request({
      data: {
        jsonrpc: "1.0",
        method: "getrawtransaction",
        params: [transactionId, true]
      }
    });
    return res.data.result;
  }

  public async getTransactionWithConfirmations(
    transactionId: string,
    confirmations: number
  ): Promise<BitcoinTransaction> {
    while (true) {
      const res = await this.rpcClient.request({
        data: {
          jsonrpc: "1.0",
          method: "getrawtransaction",
          params: [transactionId, true]
        }
      });
      const transaction: BitcoinTransaction = res.data.result;
      if (transaction.confirmations >= confirmations) {
        return transaction;
      }
      await sleep(this.refreshInterval);
    }
  }

  public async close(): Promise<void> {
    await this.rpcClient.request({
      data: {
        jsonrpc: "1.0",
        method: "unloadwallet",
        params: []
      }
    });
  }

  private async assertNetwork(network: Network): Promise<void> {
    const res = await this.rpcClient.request({
      data: { jsonrpc: "1.0", method: "getblockchaininfo", params: [] }
    });

    if (res.data.result.chain !== network) {
      return Promise.reject(
        `This wallet is only connected to the ${network} network and cannot perform actions on the ${network} network`
      );
    }
  }

  private get refreshInterval(): number {
    if (this.refreshIntervalMs) {
      return this.refreshInterval;
    }
    return DEFAULT_REFRESH_INTERVAL_MS;
  }
}

export type Network = "main" | "test" | "regtest";

function hasChecksum(descriptor: string): boolean {
  const [, checksum] = descriptor.split("#", 2);

  return !!checksum && checksum.length === 8;
}
