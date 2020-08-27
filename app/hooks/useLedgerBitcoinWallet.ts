import { createContext, useContext } from 'react';
import { LedgerClient } from '../ledgerIpc';
import axios, { AxiosInstance } from 'axios';
import { Psbt } from 'bitcoinjs-lib';

const WALLET_NAME = 'tantalus';

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

export class LedgerBitcoinWallet {
  private readonly client: AxiosInstance;

  constructor(private readonly ledgerClient: LedgerClient, rpcEndpoint: string) {
    this.client = axios.create({
      baseURL: rpcEndpoint
    });
  }

  public async hasWallet(): Promise<boolean> {
    let listWalletResponse = await this.client.post<Response<string[]>>(`/`, {
      method: 'listwallets',
      params: []
    }).then(r => r.data);

    if (listWalletResponse.error) {
      throw new Error(listWalletResponse.error.message);
    }

    return listWalletResponse.result.includes(WALLET_NAME);
  }

  public async createWallet(): Promise<void> {
    if (await this.hasWallet()) {
      console.info('Wallet', WALLET_NAME, 'already exists.');
      return;
    }

    const disablePrivateKeys = true;
    const blank = true;
    const createWalletResponse = await this.client.post<Response>(`/`, {
      method: 'createwallet',
      params: [
        disablePrivateKeys,
        blank
      ]
    }).then(r => r.data);

    if (createWalletResponse.error) {
      throw new Error(createWalletResponse.error.message);
    }

    return Promise.resolve();
  }

  public async sendToAddress(address: string, satoshis: string, btcPerKB: number): Promise<string> {
    let body = await this.client.post<Response>(`/wallet/${WALLET_NAME}`, {
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
    }).then(r => r.data);

    // TODO: create an axios response middleware to make this check automatically
    if (body.error) {
      throw new Error(body.error.message);
    }

    let psbt = Psbt.fromBase64(body.result.psbt);

    let prevTxs = await Promise.all(psbt.txInputs.map(async utxo => {
      let txId = typeof utxo.hash === 'string' ? utxo.hash : utxo.hash.reverse().toString('hex');

      let body = await this.client.post<Response>(`/wallet/${WALLET_NAME}`, {
        method: 'getrawtransaction',
        params: [txId, false]
      }).then(r => r.data);

      if (body.error) {
        throw new Error(body.error.message);
      }

      return {
        tx: body.result,
        index: utxo.index
      };
    }));

    const signedTx = await this.ledgerClient.signBitcoinTransaction(psbt, prevTxs);

    return this.broadcastRawTransaction(signedTx);
  }

  public async getNewAddress(): Promise<string> {
    let body = await this.client.post<Response>(`/wallet/${WALLET_NAME}`, {
      method: 'getnewaddress',
      params: [
        '',
        'bech32'
      ]
    }).then(r => r.data);

    if (body.error) {
      throw new Error(body.error.message);
    }

    return Promise.resolve(body.result);
  }

  public async broadcastRawTransaction(hex: string): Promise<string> {
    let sendResponse = await this.client.post<Response>(`/`, {
      method: 'sendrawtransaction',
      params: [hex]
    }).then(r => r.data);

    if (sendResponse.error) {
      throw new Error(sendResponse.error.message);
    }

    return Promise.resolve(sendResponse.result);
  }

  public async getConnectedNetwork(): Promise<Network> {
    let blockchainInfoResponse = await this.client.post<Response>(`/`, {
      method: 'getblockchaininfo',
    }).then(r => r.data);

    if (blockchainInfoResponse.error) {
      throw new Error(blockchainInfoResponse.error.message);
    }

    return blockchainInfoResponse.result.chain;
  }

  public async importLedgerKeys(accountIndex = 0): Promise<void> {
    const network = await this.getConnectedNetwork();

    const descriptors = await this.ledgerClient.getBitcoinWalletDescriptors(accountIndex, network);

    const externalDescriptorInfoResponse = await this.client.post<Response>(`/`, {
      method: 'getdescriptorinfo',
      params: [descriptors.external]
    }).then(r => r.data);

    if (externalDescriptorInfoResponse.error) {
      throw new Error(externalDescriptorInfoResponse.error.message);
    }

    const internalDescriptorInfoResponse = await this.client.post<Response>(`/`, {
      method: 'getdescriptorinfo',
      params: [descriptors.internal]
    }).then(r => r.data);

    if (internalDescriptorInfoResponse.error) {
      throw new Error(internalDescriptorInfoResponse.error.message);
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
            desc: externalDescriptorInfoResponse.result.descriptor,
            internal: false,
            ...importRequestBase
          },
          {
            desc: internalDescriptorInfoResponse.result.descriptor,
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

  public async scanProgress(): Promise<boolean | ScanProgress> {
    const walletInfoResponse = await this.client.post<Response>(`/wallet/${WALLET_NAME}`, {
      method: 'getwalletinfo',
      params: []
    }).then(r => r.data);

    if (walletInfoResponse.error) {
      throw new Error(walletInfoResponse.error.message);
    }

    const scanProgress = walletInfoResponse.result.scanning;

    if (!scanProgress) {
      return false;
    }

    return {
      duration: scanProgress.duration,
      progress: scanProgress.progress * 100
    }
  }
}

const Context = createContext<LedgerBitcoinWallet>(null);

export const LedgerBitcoinWalletProvider = Context.Provider;

export function useLedgerBitcoinWallet() {
  return useContext(Context);
}
