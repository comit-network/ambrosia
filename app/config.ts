import os from "os";
import fs from "fs";
import dotenv from 'dotenv';

export interface Config {
  LEDGER_BITCOIN_ACCOUNT_INDEX: number,
  LEDGER_ETHEREUM_ACCOUNT_INDEX: number,
  LEDGER_ETHEREUM_ACCOUNT_ADDRESS: string,
  BITCOIND_ENDPOINT: string,
  WEB3_ENDPOINT: string,
  CND_URL: string
}

const ENV_PATH = `${os.homedir()}/.create-comit-app/env`;

export function fromComitEnv(): Config | null {
  if (!fs.existsSync(ENV_PATH)) {
    return null;
  }

  const comitEnv = dotenv.parse(fs.readFileSync(ENV_PATH));

  return {
    BITCOIND_ENDPOINT: `${comitEnv.BITCOIN_USERNAME}:${comitEnv.BITCOIN_PASSWORD}@${comitEnv.BITCOIN_HTTP_URI}`,
    WEB3_ENDPOINT: comitEnv.ETHEREUM_NODE_HTTP_URL,
    LEDGER_BITCOIN_ACCOUNT_INDEX: 0,
    LEDGER_ETHEREUM_ACCOUNT_INDEX: 0,
    LEDGER_ETHEREUM_ACCOUNT_ADDRESS: '0x5087fb5F19f8EF0585b4EFcb3375De97C9d0fE0e', // This is only valid for Daniel's Nano Ledger :)
    CND_URL: comitEnv.HTTP_URL_CND_0
  };
}
