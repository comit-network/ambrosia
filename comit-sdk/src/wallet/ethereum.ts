import { BigNumber } from "bignumber.js";
import { Contract, ethers, Wallet } from "ethers";
import {
  TransactionReceipt,
  TransactionRequest,
  TransactionResponse
} from "ethers/providers";
import {
  Arrayish,
  BigNumber as BigNumberEthers,
  SigningKey
} from "ethers/utils";
import { EventFragment, FunctionFragment } from "ethers/utils/abi-coder";
import { HDNode } from "ethers/utils/hdnode";
import erc20 from "../../ethereum_abi/erc20.json";

/**
 * Simple Ethereum wallet based on [ethers.js]{@link https://github.com/ethers-io/ethers.js/}.
 */
export class EthereumWallet {
  private readonly wallet: Wallet;

  public constructor(jsonRpcUrl: string, key?: SigningKey | HDNode | Arrayish) {
    const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);
    const wallet = key ? new ethers.Wallet(key) : ethers.Wallet.createRandom();

    this.wallet = wallet.connect(provider);
  }

  public getAccount(): string {
    return this.wallet.address;
  }

  public async getBalance(): Promise<BigNumberEthers> {
    return this.wallet.getBalance();
  }

  public async getErc20Balance(
    contractAddress: string,
    decimals?: number
  ): Promise<BigNumber> {
    const abi = erc20 as Array<FunctionFragment | EventFragment>;
    const contract = new Contract(contractAddress, abi, this.wallet.provider);

    let dec;
    if (decimals === undefined) {
      try {
        dec = await contract.decimals();
      } catch (e) {
        // decimals() not present on token contract, defaulting to 18
        dec = 18;
      }
    } else {
      dec = decimals;
    }

    const strBalance = await contract.balanceOf(this.wallet.address);
    const intBalance = new BigNumber(strBalance);
    return intBalance.div(new BigNumber(10).pow(dec));
  }

  public async deployContract(
    data: string,
    amount: BigNumber,
    gasLimit: string,
    chainId: number
  ): Promise<string> {
    await this.assertNetwork(chainId);
    const value = new BigNumberEthers(amount.toString());
    const transaction: TransactionRequest = {
      data,
      value,
      gasLimit
    };
    return this.sendTransaction(transaction);
  }

  public async callContract(
    data: string,
    contractAddress: string,
    gasLimit: string,
    chainId: number
  ): Promise<string> {
    await this.assertNetwork(chainId);
    const transaction: TransactionRequest = {
      data,
      to: contractAddress,
      gasLimit
    };
    return this.sendTransaction(transaction);
  }

  public async getTransactionReceipt(
    transactionId: string
  ): Promise<TransactionReceipt> {
    return this.wallet.provider.getTransactionReceipt(transactionId);
  }

  public async getTransaction(
    transactionId: string
  ): Promise<TransactionResponse> {
    return this.wallet.provider.getTransaction(transactionId);
  }

  private async sendTransaction(
    transaction: TransactionRequest
  ): Promise<string> {
    const response = await this.wallet.sendTransaction(transaction);

    if (!response.hash) {
      throw new Error("Returned transaction didn't have a hash.");
    }

    return response.hash;
  }

  private async assertNetwork(expectedChainId: number): Promise<void> {
    const actualNetwork = await this.wallet.provider.getNetwork();

    if (actualNetwork.chainId !== expectedChainId) {
      return Promise.reject(
        `This wallet is connected to the chain with chainId: ${expectedChainId}  and cannot perform actions on chain with chainId ${actualNetwork.chainId}`
      );
    }
  }
}
