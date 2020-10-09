import React from 'react';
import { hot } from 'react-hot-loader/root';
import { CSSReset, ThemeProvider } from '@chakra-ui/core';
import AppRegionDrag from './components/AppRegionDrag';
import customTheme from './theme';
import Layout from './pages/Layout';
import { Provider as CndProvider } from './hooks/useCnd';
import { useConfig } from './config';
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
import { History } from 'history';

interface Props {
  history: History;
}

const App = ({ history }: Props) => {
  const [config] = useConfig();

  // emotions bug fix, see: https://github.com/emotion-js/emotion/issues/1105#issuecomment-557726922
  const myCache = createCache();
  myCache.compat = true;

  return (
    <CndProvider value={config.CND_URL}>
      <ThemeProvider theme={customTheme}>
        <LedgerBitcoinWalletProvider
          value={
            new LedgerBitcoinWallet(
              new LedgerClient(ipcRenderer),
              config.LEDGER_BITCOIN_ACCOUNT_INDEX,
              config.BITCOIND_ENDPOINT
            )
          }
        >
          <LedgerEthereumWalletProvider
            value={
              new LedgerEthereumWallet(
                new LedgerClient(ipcRenderer),
                {
                  index: config.LEDGER_ETHEREUM_ACCOUNT_INDEX,
                  address: config.LEDGER_ETHEREUM_ACCOUNT_ADDRESS
                },
                config.WEB3_ENDPOINT
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
  );
};

export default hot(App);
