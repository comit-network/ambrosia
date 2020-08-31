import { LedgerClient } from '../ledgerIpc';
import ethers, { UnsignedTransaction } from 'ethers';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { createContext, useContext } from 'react';
import abi from '@ethersproject/abi';

interface Account {
  index: number,
  address: string
}

const erc20Interface = new abi.Interface([
  "function balanceOf(address owner) view returns (uint256)",
]);

export class LedgerEthereumWallet {
  web3: ethers.ethers.providers.JsonRpcProvider;

  constructor(private readonly ledgerClient: LedgerClient, private readonly account: Account, rpcEndpoint: string) {
    this.web3 = new ethers.providers.JsonRpcProvider(rpcEndpoint);
  }

  public async getNetwork(): Promise<string> {
    const network = await this.web3.getNetwork();

    return network.name
  }

  public async signAndSend(tx: UnsignedTransaction): Promise<TransactionResponse> {
    const network = await this.web3.getNetwork();
    const nonce = await this.web3.getTransactionCount(this.account.address);

    const serialized = ethers.utils.serializeTransaction({
      ...tx,
      nonce: nonce,
      chainId: network.chainId
    });

    const signedTx = await this.ledgerClient.signEthereumTransaction(serialized, this.account.index, network.chainId);

    return this.web3.sendTransaction(signedTx);
  }

  /**
   * Returns the ETH balance of the account in WEI.
   */
  public async getEtherBalance(): Promise<string> {
    const balance = await this.web3.getBalance(this.account.address);

    return balance.toString()
  }

  /**
   * Returns the ERC20 token balance of the account in WEI.
   */
  public async getErc20Balance(contract: string): Promise<string> {
    const erc20Contract = new ethers.Contract(contract, erc20Interface, this.web3);
    const balance = await erc20Contract.balanceOf(this.account.address);

    return balance.toString()
  }
}

const Context = createContext<LedgerEthereumWallet>(null);

export const LedgerEthereumWalletProvider = Context.Provider;

export function useLedgerEthereumWallet() {
  return useContext(Context);
}
