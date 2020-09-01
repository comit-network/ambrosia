import { IpcMain, IpcRenderer } from 'electron';
import { crypto, Psbt } from 'bitcoinjs-lib';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import AppBtc from '@ledgerhq/hw-app-btc';
import AppEth from '@ledgerhq/hw-app-eth';
import createXPub from 'create-xpub';
import { serializeTransactionOutputs } from '@ledgerhq/hw-app-btc/lib/serializeTransaction';
import { Network } from './hooks/useLedgerBitcoinWallet';
import { UnsignedTransaction } from 'ethers';
import { serializeTransaction } from 'ethers/lib/utils';

const SIGN_BITCOIN_TRANSACTION = 'sign-bitcoin-transaction';
const GET_BITCOIN_WALLET_DESCRIPTORS = 'get-bitcoin-wallet-descriptors';
const GET_ETHEREUM_ACCOUNT = 'get-ethereum-account';
const SIGN_ETHEREUM_TRANSACTION = 'sign-ethereum-transaction';

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

  async getEthereumAccount(accountIndex): Promise<string> {
    return this.ipc.invoke(GET_ETHEREUM_ACCOUNT, accountIndex);
  }

  async signEthereumTransaction(hex: UnsignedTransaction, accountIndex: number, chainId: number): Promise<{v: number, r: string, s: string}> {
    return this.ipc.invoke(SIGN_ETHEREUM_TRANSACTION, serializeTransaction(hex), accountIndex, chainId);
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
    this.ipc.handle(GET_ETHEREUM_ACCOUNT, async (_, accountIndex) => {
      let transport = await TransportNodeHid.open();
      const eth = new AppEth(transport)
      const result = await eth.getAddress(`m/44'/60'/${accountIndex}'/0`)

      return result.address;
    })
    this.ipc.handle(SIGN_ETHEREUM_TRANSACTION, async (_, tx, accountIndex, chainId) => {
      let transport = await TransportNodeHid.open();
      const eth = new AppEth(transport)

      const hex = tx.startsWith("0x") ? tx.substr(2) : tx;

      let {v, r, s} = await eth.signTransaction(`m/44'/60'/${accountIndex}'/0`, hex);

      // Work around Ledger not properly supporting EIP155 for chainIds > 255
      // https://github.com/LedgerHQ/ledgerjs/issues/168
      // https://eips.ethereum.org/EIPS/eip-155
      let rv = parseInt(v, 16);
      let cv = chainId * 2 + 35;

      if (rv !== cv && (rv & cv) !== rv) {
        cv += 1;
      }
      v = cv;
      r = "0x" + r;
      s = "0x" + s;

      return {
        v, r, s
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
  const transport = await TransportNodeHid.open("");
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
