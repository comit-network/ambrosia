import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { CSSReset, ThemeProvider } from '@chakra-ui/core';
import Store from 'electron-store';
import { Store as ReduxStore } from 'redux';
import AppRegionDrag from './components/AppRegionDrag';
import customTheme from './theme';
import Layout from './pages/Layout';
import { BitcoinWalletProvider } from './hooks/useBitcoindWallet';
import { EthereumWalletProvider } from './hooks/useEthereumWallet';
import { CndProvider } from './hooks/useCnd';
import { LedgerClient } from './ledgerIpc';
import { ipcRenderer } from 'electron';
import { LedgerBitcoinWallet, LedgerBitcoinWalletProvider } from './hooks/useLedgerBitcoinWallet';
import { LedgerEthereumWallet, LedgerEthereumWalletProvider } from './hooks/useLedgerEthereumWallet';

type Props = {
  store: ReduxStore;
  history: History;
  settings: Store;
};

const App = ({ store, history, settings }: Props) => {

  return (
    <CndProvider settings={settings}>
      <BitcoinWalletProvider settings={settings}>
        <EthereumWalletProvider settings={settings}>
          <ThemeProvider theme={customTheme}>
            <LedgerBitcoinWalletProvider value={new LedgerBitcoinWallet(new LedgerClient(ipcRenderer), settings.get('LEDGER_BITCOIN_ACCOUNT_INDEX'), settings.get('BITCOIND_ENDPOINT'))}>
              <LedgerEthereumWalletProvider value={new LedgerEthereumWallet(new LedgerClient(ipcRenderer), {
                index: settings.get('LEDGER_ETHEREUM_ACCOUNT_INDEX'),
                address: settings.get('LEDGER_ETHEREUM_ACCOUNT_ADDRESS')
              }, settings.get('WEB3_ENDPOINT'))}>
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
        </EthereumWalletProvider>
      </BitcoinWalletProvider>
    </CndProvider>
  );
};

export default hot(App);
