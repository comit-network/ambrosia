import { IpcMain, IpcRenderer } from 'electron';
import { Psbt } from 'bitcoinjs-lib';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import AppBtc from '@ledgerhq/hw-app-btc';
import { serializeTransactionOutputs } from '@ledgerhq/hw-app-btc/lib/serializeTransaction';

const SIGN_BITCOIN_TRANSACTION = 'sign-bitcoin-transaction';

export class LedgerClient {

  constructor(private readonly ipc: IpcRenderer) {
  }

  async signBitcoinTransaction(psbt: Psbt, previousTransactions: {tx: string, index: number}[]): Promise<string> {
    return this.ipc.invoke(SIGN_BITCOIN_TRANSACTION, psbt.toBase64(), previousTransactions);
  }

}

export class LedgerServer {

  constructor(private readonly ipc: IpcMain) {

  }

  start() {
    this.ipc.handle(SIGN_BITCOIN_TRANSACTION, (_, psbt, previousTransactions) => {
      return this.sign(Psbt.fromBase64(psbt), previousTransactions);
    })
  }

  async sign(psbt: Psbt, previousTransactions: {tx: string, index: number}[]): Promise<string> {
    const transport = await TransportNodeHid.open();
    const btc = new AppBtc(transport);

    let inputs = previousTransactions.map(({tx, index}) => {
      return [btc.splitTransaction(tx, true), index]
    });
    let derivationPaths = psbt.data.inputs.map(input => input.bip32Derivation[0].path);
    const outputScriptHex = await serializeTransactionOutputs({
      outputs: psbt.txOutputs.map(output => {
        let amount = Buffer.alloc(8);
        amount.writeBigUInt64LE(BigInt(output.value), 0);

        return {
          amount: amount,
          script: output.script
        }
      })
    }).toString('hex');

    return btc.createPaymentTransactionNew({
      inputs,
      associatedKeysets: derivationPaths,
      outputScriptHex,
      segwit: true,
      additionals: ["bech32"]
    })
  }
}
