import os from "os";
import fs from "fs";
import dotenv from 'dotenv';

export interface Config {
  LEDGER_BITCOIN_ACCOUNT_INDEX: number,
  LEDGER_ETHEREUM_ACCOUNT_INDEX: number,
  LEDGER_ETHEREUM_ACCOUNT_ADDRESS: string,
  BITCOIND_ENDPOINT: string,
  WEB3_ENDPOINT: string,
  CND_URL: string,
  SETUP_COMPLETE: boolean,
  ERC20_CONTRACT_ADDRESS: string
}

const ENV_PATH = `${os.homedir()}/.create-comit-app/env`;

export function fromComitEnv(): Config | null {
  if (!fs.existsSync(ENV_PATH)) {
    return null;
  }

  const comitEnv = dotenv.parse(fs.readFileSync(ENV_PATH));

  const bitcoindHttpUri = new URL(comitEnv.BITCOIN_HTTP_URI);

  return {
    BITCOIND_ENDPOINT: `http://${comitEnv.BITCOIN_USERNAME}:${comitEnv.BITCOIN_PASSWORD}@${bitcoindHttpUri.host}`,
    WEB3_ENDPOINT: comitEnv.ETHEREUM_NODE_HTTP_URL,
    LEDGER_BITCOIN_ACCOUNT_INDEX: 0,
    LEDGER_ETHEREUM_ACCOUNT_INDEX: 0,
    LEDGER_ETHEREUM_ACCOUNT_ADDRESS: '0x5087fb5F19f8EF0585b4EFcb3375De97C9d0fE0e', // This is only valid for Daniel's Nano Ledger :)
    CND_URL: "http://127.0.0.1:8000",
    SETUP_COMPLETE: true,
    ERC20_CONTRACT_ADDRESS: comitEnv.ERC20_CONTRACT_ADDRESS // TODO: This should be fetched from cnd instead!
  };
}
