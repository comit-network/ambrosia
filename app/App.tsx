import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { CSSReset, ThemeProvider } from '@chakra-ui/core';
import AppRegionDrag from './components/AppRegionDrag';
import customTheme from './theme';
import Layout from './pages/Layout';
import { Provider as CndProvider } from './hooks/useCnd';
import { Config, Provider as ConfigProvider } from './config';
import { LedgerClient } from './ledgerIpc';
import { ipcRenderer } from 'electron';
import {
  LedgerBitcoinWallet,
  LedgerBitcoinWalletProvider
} from './hooks/useLedgerBitcoinWallet';
import {
  LedgerEthereumWallet,
  LedgerEthereumWalletProvider
} from './hooks/useLedgerEthereumWallet';
import { CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import { Router } from 'react-router';
import ElectronStore from 'electron-store';
import { History } from 'history';

const electronStore = new ElectronStore<Config>();

interface Props {
  comitEnvConfig?: Config;
  history: History;
}

const App = ({ comitEnvConfig, history }: Props) => {
  const [effectiveConfig, setEffectiveConfig] = useState(null);

  // if we are not passed a config from comit-env, read the config file through electron-store
  useEffect(() => {
    if (!comitEnvConfig) {
      console.info('Using config file', electronStore.path);
      setEffectiveConfig(electronStore.store);
    } else {
      setEffectiveConfig(comitEnvConfig);
    }
  }, [comitEnvConfig]);

  const updateConfig = (newConfig: Config) => {
    // if we don't have a comit-env config, we need to update the config file through electron-store
    if (!comitEnvConfig) {
      electronStore.set(newConfig);
    }

    // always update the effective config
    setEffectiveConfig(newConfig);
  };

  if (!effectiveConfig) {
    return null;
  }
  // emotions bug fix, see: https://github.com/emotion-js/emotion/issues/1105#issuecomment-557726922
  const myCache = createCache();
  myCache.compat = true;

  return (
    <ConfigProvider value={[effectiveConfig, updateConfig]}>
      <CndProvider value={effectiveConfig.CND_URL}>
        <ThemeProvider theme={customTheme}>
          <LedgerBitcoinWalletProvider
            value={
              new LedgerBitcoinWallet(
                new LedgerClient(ipcRenderer),
                effectiveConfig.LEDGER_BITCOIN_ACCOUNT_INDEX,
                effectiveConfig.BITCOIND_ENDPOINT
              )
            }
          >
            <LedgerEthereumWalletProvider
              value={
                new LedgerEthereumWallet(
                  new LedgerClient(ipcRenderer),
                  {
                    index: effectiveConfig.LEDGER_ETHEREUM_ACCOUNT_INDEX,
                    address: effectiveConfig.LEDGER_ETHEREUM_ACCOUNT_ADDRESS
                  },
                  effectiveConfig.WEB3_ENDPOINT
                )
              }
            >
              <CSSReset />
              <Router history={history}>
                {process.platform === 'darwin' ? <AppRegionDrag /> : null}
                <CacheProvider value={myCache}>
                  <Layout />
                </CacheProvider>
              </Router>
            </LedgerEthereumWalletProvider>
          </LedgerBitcoinWalletProvider>
        </ThemeProvider>
      </CndProvider>
    </ConfigProvider>
  );
};

export default hot(App);
