import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { CSSReset, ThemeProvider } from '@chakra-ui/core';
import { Store as ReduxStore } from 'redux';
import AppRegionDrag from './components/AppRegionDrag';
import customTheme from './theme';
import Layout from './pages/Layout';
import { CndProvider } from './hooks/useCnd';
import { LedgerClient } from './ledgerIpc';
import { ipcRenderer } from 'electron';
import { LedgerBitcoinWallet, LedgerBitcoinWalletProvider } from './hooks/useLedgerBitcoinWallet';
import { LedgerEthereumWallet, LedgerEthereumWalletProvider } from './hooks/useLedgerEthereumWallet';
import { Config } from './config';

type Props = {
  store: ReduxStore;
  history: History;
  settings: Config;
};

const App = ({ store, history, settings }: Props) => {

  return (
    <CndProvider settings={settings}>
      <ThemeProvider theme={customTheme}>
        <LedgerBitcoinWalletProvider value={new LedgerBitcoinWallet(new LedgerClient(ipcRenderer), settings.LEDGER_BITCOIN_ACCOUNT_INDEX, settings.BITCOIND_ENDPOINT)}>
          <LedgerEthereumWalletProvider value={new LedgerEthereumWallet(new LedgerClient(ipcRenderer), {
            index: settings.LEDGER_ETHEREUM_ACCOUNT_INDEX,
            address: settings.LEDGER_ETHEREUM_ACCOUNT_ADDRESS
          }, settings.WEB3_ENDPOINT)}>
            <CSSReset />
            <Provider store={store}>
              <ConnectedRouter history={history}>
                {process.platform === 'darwin' ? <AppRegionDrag /> : null}
                <Layout settings={settings} />
              </ConnectedRouter>
            </Provider>
          </LedgerEthereumWalletProvider>
        </LedgerBitcoinWalletProvider>
      </ThemeProvider>
    </CndProvider>
  );
};

export default hot(App);
