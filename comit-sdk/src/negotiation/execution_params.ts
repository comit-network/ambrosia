import moment from "moment";

// Information that cannot be deduced from the order and is not up for negotiation
// Matches exactly cnd http api
export interface ExecutionParams {
  peer: {
    peer_id: string;
    address_hint: string;
  };
  alpha_expiry: number;
  beta_expiry: number;
  ledgers?: LedgerParams;
}

export function defaultLedgerParams(): LedgerParams {
  return { bitcoin: { network: "mainnet" }, ethereum: { chain_id: 1 } };
}

interface LedgerParams {
  [name: string]: {
    network?: string;
    chain_id?: number;
  };
}

export function isValidExecutionParams(
  executionParams?: ExecutionParams
): boolean {
  if (!executionParams) {
    return false;
  }
  const now = moment().unix();
  const relativeAlphaExpiry = executionParams.alpha_expiry - now;
  const relativeBetaExpiry = executionParams.beta_expiry - now;

  if (!executionParams.ledgers) {
    executionParams.ledgers = defaultLedgerParams();
  }

  switch (getNetworkType(executionParams.ledgers)) {
    case NetworkType.AllMainnet: {
      // For mainnet, we expect 12 hours and 24 hours expiry.
      // Checking 11 hours/23 hours cause we're lazy and it's still good enough
      return (
        relativeAlphaExpiry > 23 * 60 * 60 &&
        relativeBetaExpiry > 11 * 60 * 60 &&
        relativeAlphaExpiry > relativeBetaExpiry
      );
    }
    case NetworkType.AllTest: {
      // For testnet/regtest: don't really care as long as it makes sense
      return relativeAlphaExpiry > relativeBetaExpiry;
    }
    default:
      return false;
  }
}

export enum NetworkType {
  AllMainnet = "main",
  AllTest = "test",
  Invalid = "invalid"
}

function getNetworkType(ledgerParams: LedgerParams): NetworkType {
  // If there are no ledgers params then it returns invalid which is fine
  let type = NetworkType.Invalid;
  for (const name of Object.keys(ledgerParams)) {
    const params = ledgerParams[name];
    // This is really a dummy way to check that assume Bitcoin or Ethereum
    if (params.chain_id === 1 || params.network === "mainnet") {
      if (type === NetworkType.AllTest) {
        return NetworkType.Invalid;
      }
      type = NetworkType.AllMainnet;
    } else {
      if (type === NetworkType.AllMainnet) {
        return NetworkType.Invalid;
      }
      type = NetworkType.AllTest;
    }
  }

  return type;
}
