import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { ThemeProvider, CSSReset } from '@chakra-ui/core';
import AppRegionDrag from './components/AppRegionDrag';
import customTheme from './theme';
import { Store } from './reducers/types';
import Layout from './pages/Layout';
// import { WalletStoreProvider } from '../hooks/useWalletStore';
// import { BitcoinWalletProvider } from '../hooks/useBitcoinWallet';
// import { EthereumWalletProvider } from '../hooks/useEthereumWallet';
// import { CndProvider } from '../hooks/useCnd';
// import { ComitClientProvider } from '../hooks/useComitClient';

type Props = {
  store: Store;
  history: History;
};

// TODO: Insert all COMITproviders here
// TODO: Insert Chakra theme provider here
// Note: App should be the one to contain routes

const App = ({ store, history }: Props) => (
  <ThemeProvider theme={customTheme}>
    <CSSReset />
    <Provider store={store}>
      <ConnectedRouter history={history}>
        {process.platform === 'darwin' ? <AppRegionDrag /> : null}
        <Layout />
      </ConnectedRouter>
    </Provider>
  </ThemeProvider>
);

export default hot(App);
