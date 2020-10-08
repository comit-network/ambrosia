import os from 'os';
import fs from 'fs';
import dotenv from 'dotenv';
import { createContext, useContext } from 'react';
import { Role } from './utils/swap';

export interface Config {
  LEDGER_BITCOIN_ACCOUNT_INDEX: number;
  LEDGER_ETHEREUM_ACCOUNT_INDEX: number;
  LEDGER_ETHEREUM_ACCOUNT_ADDRESS: string;
  BITCOIND_ENDPOINT: string;
  WEB3_ENDPOINT: string;
  CND_URL: string;
  SETUP_COMPLETE: boolean;
  ROLE: Role;
  SWAP_POLL_INTERVAL_MS: number;
  BITCOIN_BALANCE_POLL_INTERVAL_MS: number;
  ETHEREUM_BALANCE_POLL_INTERVAL_MS: number;
}

const ENV_PATH = `${os.homedir()}/.create-comit-app/env`;

export function fromComitEnv(): Config | null {
  if (!fs.existsSync(ENV_PATH)) {
    return null;
  }

  const comitEnv = dotenv.parse(fs.readFileSync(ENV_PATH));

  const bitcoindHttpUri = new URL(comitEnv.BITCOIN_HTTP_URI);

  let role;
  switch (process.env.ROLE) {
    case Role.ALICE:
      role = Role.ALICE;
      break;
    case Role.BOB:
      role = Role.BOB;
      break;
    default:
      role = Role.ALICE;
      break;
  }

  const config = {
    BITCOIND_ENDPOINT: `http://${comitEnv.BITCOIN_USERNAME}:${comitEnv.BITCOIN_PASSWORD}@${bitcoindHttpUri.host}`,
    WEB3_ENDPOINT: comitEnv.ETHEREUM_NODE_HTTP_URL,
    LEDGER_BITCOIN_ACCOUNT_INDEX: role === Role.ALICE ? 0 : 1,
    LEDGER_ETHEREUM_ACCOUNT_INDEX: role === Role.ALICE ? 0 : 1,
    LEDGER_ETHEREUM_ACCOUNT_ADDRESS:
      role === Role.ALICE
        ? '0xf205D55E96c607EEe898Cf20e515559fe0134317'
        : '0x0C81b364E733E940A23669c5b11DF3f94cb542cA',
    CND_URL:
      role === Role.ALICE ? 'http://127.0.0.1:8000' : 'http://127.0.0.1:8100',
    SETUP_COMPLETE: true,
    ROLE: role,
    SWAP_POLL_INTERVAL_MS: 1000,
    BITCOIN_BALANCE_POLL_INTERVAL_MS: 1000,
    ETHEREUM_BALANCE_POLL_INTERVAL_MS: 1000
  };

  console.info('Starting in dev-mode with config:', config);

  return config;
}

type ConfigSetter = (config: Partial<Config>) => void;

const CONFIG_CONTEXT = createContext<[Config, ConfigSetter]>(null);

export const Provider = CONFIG_CONTEXT.Provider;

export function useConfig() {
  return useContext(CONFIG_CONTEXT);
}
