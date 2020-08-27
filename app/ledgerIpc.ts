import { IpcMain, IpcRenderer } from 'electron';
import { Psbt, crypto } from 'bitcoinjs-lib';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import AppBtc from '@ledgerhq/hw-app-btc';
import createXPub from "create-xpub"
import { serializeTransactionOutputs } from '@ledgerhq/hw-app-btc/lib/serializeTransaction';
import { Network } from './hooks/useLedgerBitcoinWallet';

const SIGN_BITCOIN_TRANSACTION = 'sign-bitcoin-transaction';
const GET_BITCOIN_WALLET_DESCRIPTORS = 'get-bitcoin-wallet-descriptors';

export interface Descriptors {
  external: string,
  internal: string
}

export class LedgerClient {

  constructor(private readonly ipc: IpcRenderer) {
  }

  async signBitcoinTransaction(psbt: Psbt, previousTransactions: {tx: string, index: number}[]): Promise<string> {
    return this.ipc.invoke(SIGN_BITCOIN_TRANSACTION, psbt.toBase64(), previousTransactions);
  }

  async getBitcoinWalletDescriptors(accountIndex, network: Network): Promise<Descriptors> {
    return this.ipc.invoke(GET_BITCOIN_WALLET_DESCRIPTORS, accountIndex, network);
  }
}

export class LedgerServer {

  constructor(private readonly ipc: IpcMain) {

  }

  start() {
    this.ipc.handle(SIGN_BITCOIN_TRANSACTION, (_, psbt, previousTransactions) => {
      return sign(Psbt.fromBase64(psbt), previousTransactions);
    });
    this.ipc.handle(GET_BITCOIN_WALLET_DESCRIPTORS, async (_, accountIndex, network) => {
      const external = await getWalletDescriptors(0, accountIndex, network);
      const internal = await getWalletDescriptors(1, accountIndex, network);

      return {
        external,
        internal
      }
    })
  }
}


async function sign(psbt: Psbt, previousTransactions: {tx: string, index: number}[]): Promise<string> {
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

function makeFingerPrint(publicKey) {
  return crypto.hash160(Buffer.from(compressPublicKey(publicKey), 'hex')).toString('hex').substr(0, 8);
}

const compressPublicKey = publicKey => {
  if (publicKey.startsWith('02') || publicKey.startsWith('03')) {
    return publicKey;
  }

  const yIsEven = (parseInt(publicKey.slice(-2), 16) % 2 === 0);

  return (yIsEven ? '02' : '03') + publicKey.slice(2, 66);
};

async function getWalletDescriptors(change: number, account: number, network: Network) {
  const transport = await TransportNodeHid.open();
  const btc = new AppBtc(transport);

  const master = await btc.getWalletPublicKey('', { format: 'bech32' });
  let fingerprint = makeFingerPrint(master.publicKey);

  const coinType = network === "main" ? 0 : 1;
  const networkVersion = network === "main" ? createXPub.mainnet : createXPub.testnet;

  let path = `/84'/${coinType}'/${account}'`;
  const result = await btc.getWalletPublicKey(`m${path}`, { format: 'bech32' });
  let xpub = createXPub({
    networkVersion: networkVersion,
    depth: 3,
    childNumber: 0,
    ...result
  });

  return `wpkh([${fingerprint}${path}]${xpub}/${change}/*)`;
}
