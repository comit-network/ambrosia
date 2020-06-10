import _ from 'lodash';
import BN from 'bn.js';
import moment from 'moment';
import { toSatoshi } from 'satoshi-bitcoin-ts';
import { Swap } from 'comit-sdk';

export { default as TakerStateMachine } from './stateMachine';

function isString(s: any) {
  return typeof s === 'string' || s instanceof String;
}

function toBaseUnit(val: any, decimals: number) {
  let value = val;
  if (!isString(value)) {
    throw new Error('Pass strings to prevent floating point precision issues.');
  }
  const ten = new BN(10);
  const base = ten.pow(new BN(decimals));

  // Is it negative?
  const negative = value.substring(0, 1) === '-';
  if (negative) {
    value = value.substring(1);
  }

  if (value === '.') {
    throw new Error(
      `Invalid value ${value} cannot be converted to` +
        ` base unit with ${decimals} decimals.`
    );
  }

  // Split it into a whole and fractional part
  const comps = value.split('.');
  if (comps.length > 2) {
    throw new Error('Too many decimal points');
  }

  let whole = comps[0];
  let fraction = comps[1];

  if (!whole) {
    whole = '0';
  }
  if (!fraction) {
    fraction = '0';
  }
  if (fraction.length > decimals) {
    throw new Error('Too many decimal places');
  }

  while (fraction.length < decimals) {
    fraction += '0';
  }

  whole = new BN(whole);
  fraction = new BN(fraction);
  let wei = whole.mul(base).add(fraction);

  if (negative) {
    wei = wei.neg();
  }

  return new BN(wei.toString(10), 10);
}

function newSwap(swap, cnd, bitcoinWallet, ethereumWallet) {
  if (!bitcoinWallet) {
    throw new Error('BitcoinWallet is not set.');
  }

  if (!ethereumWallet) {
    throw new Error('EthereumWallet is not set.');
  }

  return new Swap(
    cnd,
    swap.links.find(link => link.rel.includes('self')).href,
    { bitcoin: bitcoinWallet, ethereum: ethereumWallet }
  );
}

// This function should be part of the SDK
export async function getSwaps(cnd, bitcoinWallet, ethereumWallet) {
  const swapSubEntities = await cnd.getSwaps();
  const swaps = swapSubEntities.map(swap =>
    newSwap(swap, cnd, bitcoinWallet, ethereumWallet)
  );
  return swaps;
}

export async function fetchProperties(swaps) {
  const result = await Promise.all(_.map(swaps, s => s.fetchDetails()));
  const propertiesList = _.map(result, details => {
    const { properties } = details;
    return properties;
  });
  return propertiesList;
}

export async function fetchPropertiesById(client, swapId) {
  const swap = await client.retrieveSwapById(swapId);
  const { properties } = await swap.fetchDetails();
  return properties;
}

// Note: this is only for Alpha: DAI and Beta: BTC
export function buildSwap(
  makerPeerId,
  makerAddressHint,
  takerRefundAddress,
  daiAmount,
  btcAmount
) {
  const message = {
    alpha_ledger: {
      name: 'ethereum',
      chain_id: 17
    },
    beta_ledger: {
      name: 'bitcoin',
      network: 'regtest'
    },
    alpha_asset: {
      name: 'erc20',
      token_contract: process.env.ERC20_CONTRACT_ADDRESS,
      quantity: toBaseUnit(daiAmount.toString(), 18).toString() // ERC20 amount in 18 decimals, converted from float
    },
    beta_asset: {
      name: 'bitcoin',
      quantity: toSatoshi(btcAmount).toString()
    },
    alpha_ledger_refund_identity: takerRefundAddress,
    // This field below is only used for the reverse, where beta_ledger is Ethereum
    // beta_ledger_redeem_identity: takerRefundAddress
    alpha_expiry: moment().unix() + 7200,
    beta_expiry: moment().unix() + 3600,
    peer: {
      peer_id: makerPeerId,
      address_hint: makerAddressHint
    }
  };
  return message;
}
