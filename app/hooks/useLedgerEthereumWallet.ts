import { LedgerClient } from '../ledgerIpc';
import ethers, { BigNumber, UnsignedTransaction } from 'ethers';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { createContext, useContext } from 'react';
import { Interface } from '@ethersproject/abi';

interface Account {
  index: number,
  address: string
}

const erc20Interface = new Interface([
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
  public async getEtherBalance(): Promise<BigNumber> {
    return this.web3.getBalance(this.account.address);
  }

  /**
   * Returns the ERC20 token balance of the account in WEI.
   */
  public async getErc20Balance(contract: string): Promise<BigNumber> {
    const erc20Contract = new ethers.Contract(contract, erc20Interface, this.web3);
    const balance = await erc20Contract.balanceOf(this.account.address);

    return BigNumber.from(balance)
  }
}

const Context = createContext<LedgerEthereumWallet>(null);

export const LedgerEthereumWalletProvider = Context.Provider;

export function useLedgerEthereumWallet() {
  return useContext(Context);
}
