import { createContext, useContext } from 'react';
import { Descriptors, LedgerClient } from '../ledgerIpc';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { Psbt } from 'bitcoinjs-lib';

const WALLET_NAME = 'tantalus';

export class LedgerBitcoinWallet {
  private readonly client: AxiosInstance;

  constructor(private readonly ledgerClient: LedgerClient, private readonly accountIndex: number, rpcEndpoint: string) {
    this.client = axios.create({
      baseURL: rpcEndpoint,
    });
    this.client.interceptors.response.use((response) =>  ({
      ...response,
      data: response.data.result
    }), jsonRpcResponseInterceptor)
  }

  public async hasWallet(): Promise<boolean> {
    let wallets = await this.client.post(`/`, {
      method: 'listwallets',
      params: []
    }).then(r => r.data);

    return wallets.includes(WALLET_NAME);
  }

  public async createWallet(descriptors: Descriptors): Promise<void> {
    if (!await this.hasWallet()) {
      const disablePrivateKeys = true;
      const blank = true;
      await this.client.post<Response>(`/`, {
        method: 'createwallet',
        params: [
          WALLET_NAME,
          disablePrivateKeys,
          blank
        ]
      }).then(r => r.data);
    }

    const importRequestBase = {
      timestamp: 0,
      range: 1000,
      watchonly: true,
      keypool: true
    };

    await this.client.post<Response>(`/wallet/${WALLET_NAME}`, {
      method: 'importmulti',
      params: [
        [
          {
            desc: descriptors.external,
            internal: false,
            ...importRequestBase
          },
          {
            desc: descriptors.internal,
            internal: true,
            ...importRequestBase
          },
        ],
        {
          rescan: true
        }
      ]
    }).then(r => r.data);
  }

  public async sendToAddress(address: string, satoshis: string, btcPerKB: number): Promise<string> {
    let psbt = await this.client.post(`/wallet/${WALLET_NAME}`, {
      method: 'walletcreatefundedpsbt',
      params: [
        [],
        [
          {
            [address]: parseInt(satoshis, 10) / 100_000_000
          }
        ],
        null,
        {
          feeRate: btcPerKB
        }
      ]
    }).then(r => Psbt.fromBase64(r.data));

    let prevTxs = await Promise.all(psbt.txInputs.map(async utxo => {
      let txId = typeof utxo.hash === 'string' ? utxo.hash : utxo.hash.reverse().toString('hex');

      let tx = await this.client.post(`/wallet/${WALLET_NAME}`, {
        method: 'getrawtransaction',
        params: [txId, false]
      }).then(r => r.data);

      return {
        tx,
        index: utxo.index
      };
    }));

    const signedTx = await this.ledgerClient.signBitcoinTransaction(psbt, prevTxs);

    return this.broadcastRawTransaction(signedTx);
  }

  public async getNewAddress(): Promise<string> {
    let address = await this.client.post(`/wallet/${WALLET_NAME}`, {
      method: 'getnewaddress',
      params: [
        '',
        'bech32'
      ]
    }).then(r => r.data);

    return Promise.resolve(address);
  }

  public async broadcastRawTransaction(hex: string): Promise<string> {
    let txId = await this.client.post(`/`, {
      method: 'sendrawtransaction',
      params: [hex]
    }).then(r => r.data);

    return Promise.resolve(txId);
  }

  public async getConnectedNetwork(): Promise<Network> {
    let blockchainInfo = await this.client.post(`/`, {
      method: 'getblockchaininfo',
    }).then(r => r.data);

    return blockchainInfo.chain;
  }

  public async exportLedgerWallet(): Promise<Descriptors> {
    const network = await this.getConnectedNetwork();

    const descriptors = await this.ledgerClient.getBitcoinWalletDescriptors(this.accountIndex, network);

    const externalDescriptorInfo = await this.client.post(`/`, {
      method: 'getdescriptorinfo',
      params: [descriptors.external]
    }).then(r => r.data);

    const internalDescriptorInfo = await this.client.post(`/`, {
      method: 'getdescriptorinfo',
      params: [descriptors.internal]
    }).then(r => r.data);

    return {
      internal: internalDescriptorInfo.descriptor,
      external: externalDescriptorInfo.descriptor
    }
  }

  public async scanProgress(): Promise<boolean | ScanProgress> {
    const walletInfo = await this.client.post(`/wallet/${WALLET_NAME}`, {
      method: 'getwalletinfo',
      params: []
    }).then(r => r.data);

    const scanProgress = walletInfo.scanning;

    if (!scanProgress) {
      return false;
    }

    return {
      duration: scanProgress.duration,
      progress: scanProgress.progress * 100
    }
  }

  /**
   * Returns the current balance in satoshis.
   */
  public async getBalance(): Promise<string> {
    const balance = await this.client.post(`/wallet/${WALLET_NAME}`, {
      method: 'getbalance',
      params: []
    }).then(r => r.data);

    return (balance * 100_000_000).toString(10)
  }
}

type Response<R = any> = {
  result: R,
  error: null
} | {
  result: null,
  error: {
    message: string,
    code: number,
    data: any
  }
}

export type Network = 'main' | 'test' | 'regtest';

export type Seconds = number;

export interface ScanProgress {
  duration: Seconds,
  progress: number // in percent, e.g. 56
}

function jsonRpcResponseInterceptor(error: AxiosError): Promise<AxiosError> {
  const response = error.response;

  if (!response) {
    return Promise.reject(error);
  }

  const body = JSON.parse(response.data);

  if (!body.error) {
    return Promise.reject(error);
  }

  return Promise.reject(body.error.message);
}

const Context = createContext<LedgerBitcoinWallet>(null);

export const LedgerBitcoinWalletProvider = Context.Provider;

export function useLedgerBitcoinWallet() {
  return useContext(Context);
}