import React from 'react';
import { Router } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { ThemeProvider, CSSReset } from '@chakra-ui/core';
import Store from 'electron-store';
import AppRegionDrag from './components/AppRegionDrag';
import Layout from './pages/Layout';
import { BitcoinWalletProvider } from './hooks/useBitcoinWallet';
import { EthereumWalletProvider } from './hooks/useEthereumWallet';
import { CndProvider } from './hooks/useCnd';

type Props = {
  history: History;
  settings: Store;
};

const App = ({ history, settings }: Props) => {
  return (
    <CndProvider settings={settings}>
      <BitcoinWalletProvider settings={settings}>
        <EthereumWalletProvider settings={settings}>
          <ThemeProvider>
            <CSSReset />
            <Router history={history}>
              {process.platform === 'darwin' ? <AppRegionDrag /> : null}
              <Layout />
            </Router>
          </ThemeProvider>
        </EthereumWalletProvider>
      </BitcoinWalletProvider>
    </CndProvider>
  );
};

export default hot(App);
