import { Cnd } from "./cnd/cnd";
import { ComitClient } from "./comit_client";
import { BitcoinWallet } from "./wallet/bitcoin";
import { EthereumWallet } from "./wallet/ethereum";

/**
 * Representation of an actor during swap execution.
 */
export interface Actor {
  name?: string;
  comitClient: ComitClient;
  peerId: string;
  addressHint: string;
  bitcoinWallet: BitcoinWallet;
  ethereumWallet: EthereumWallet;
}

export async function createActor(
  bitcoinWallet: BitcoinWallet,
  ethereumWallet: EthereumWallet,
  cndUrl: string,
  name?: string
): Promise<Actor> {
  const cnd = new Cnd(cndUrl!);
  const peerId = await cnd.getPeerId();
  const addressHint = await cnd
    .getPeerListenAddresses()
    .then(addresses => addresses[0]);

  const comitClient = new ComitClient(cnd)
    .withBitcoinWallet(bitcoinWallet)
    .withEthereumWallet(ethereumWallet);

  return {
    name,
    comitClient,
    peerId,
    addressHint,
    bitcoinWallet,
    ethereumWallet
  };
}
