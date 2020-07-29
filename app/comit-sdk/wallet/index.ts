import { BitcoinWallet } from "./bitcoin";
import { EthereumWallet } from "./ethereum";
import { LightningWallet } from "./lightning";

export interface AllWallets {
  bitcoin?: BitcoinWallet;
  ethereum?: EthereumWallet;
  lightning?: LightningWallet;
}

export class Wallets {
  constructor(private readonly wallets: AllWallets) {}

  get bitcoin(): BitcoinWallet {
    return this.getWalletForLedger("bitcoin") as BitcoinWallet;
  }

  get ethereum(): EthereumWallet {
    return this.getWalletForLedger("ethereum") as EthereumWallet;
  }

  get lightning(): LightningWallet {
    return this.getWalletForLedger("lightning") as LightningWallet;
  }

  public getWalletForLedger<K extends keyof AllWallets>(
    name: K
  ): AllWallets[K] {
    const wallet = this.wallets[name];

    if (!wallet) {
      throw new Error(`Wallet for ${name} is not initialised`);
    }

    return wallet;
  }
}
