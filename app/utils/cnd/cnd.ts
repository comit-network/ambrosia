import axios, { AxiosInstance, AxiosPromise } from 'axios';
import { problemResponseInterceptor } from './axios_rfc7807_middleware';

interface GetInfo {
  id: string;
  listen_addresses: string[]; // multiaddresses
}

interface Token {
  symbol: string;
  address: string;
  decimals: number;
}

export interface Ledger {
  name: string;
  chain_id?: number;
  network?: string;
}

export interface Asset {
  name: string;
  quantity: string;
  token_contract?: string;
}

export interface Peer {
  peer_id: string;
  address_hint?: string;
}

/**
 * Facilitates access to the [COMIT network daemon (cnd)](@link https://github.com/comit-network/comit-rs) REST API.
 */
export class Cnd {
  public readonly client: AxiosInstance;

  public constructor(cndUrl: string) {
    this.client = axios.create({
      baseURL: cndUrl
    });
    this.client.interceptors.response.use(
      response => response,
      problemResponseInterceptor
    );
  }

  /**
   * Get the peer id of the cnd node
   *
   * @returns Promise that resolves with the peer id of the cnd node,
   * @throws A {@link Problem} from the cnd REST API or an {@link Error}.
   */
  public async getPeerId(): Promise<string> {
    const info = await this.getInfo();
    if (!info.id) {
      throw new Error('id field not present');
    }

    return info.id;
  }

  /**
   * Get the address on which cnd is listening for peer-to-peer/COMIT messages.
   *
   * @returns An array of multiaddresses
   * @throws A {@link Problem} from the cnd REST API or an {@link Error}.
   */
  public async getPeerListenAddresses(): Promise<string[]> {
    const info = await this.getInfo();
    if (!info.listen_addresses) {
      throw new Error('listen addresses field not present');
    }

    return info.listen_addresses;
  }

  /**
   * Fetch data from the REST API.
   *
   * @param path The URL to GET.
   * @returns The data returned by cnd.
   * @throws A {@link Problem} from the cnd REST API or an {@link Error}.
   */
  public fetch<T>(path: string): AxiosPromise<T> {
    return this.client.get(path);
  }

  public async daiContractAddress(): Promise<string> {
    const tokens = await this.fetch<Token[]>('/tokens');

    const daiToken = tokens.data.find(token => token.symbol === 'DAI');

    if (!daiToken) {
      throw new Error(
        "Your cnd instance doesn't seem to know about the DAI token contract for the current network"
      );
    }

    return daiToken.address;
  }

  private async getInfo(): Promise<GetInfo> {
    const response = await this.client.get('/');

    return response.data;
  }
}
