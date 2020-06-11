import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Switch, Route, Link } from 'react-router-dom';
import { Flex, Box, Text, ThemeProvider, CSSReset } from '@chakra-ui/core';
import customTheme from '../theme';
import { Store } from '../reducers/types';
import routes from '../constants/routes.json';
import HomePage from './HomePage';
import CounterPage from './CounterPage';
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

const Root = ({ store, history }: Props) => (
  <ThemeProvider theme={customTheme}>
    <CSSReset />
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Flex flexDirection="row" minHeight="100%" alignItems="stretch">
          <Flex id="sidebar">
            <div className="fixed">
              <h2>
                <i>Menu</i>
              </h2>

              <div>
                <Link to={routes.HOME}>Home</Link>
              </div>
              <div>
                <Link to={routes.COUNTER}>Counter</Link>
              </div>
            </div>
          </Flex>
          <Flex id="content">
            <Switch>
              <Route path={routes.COUNTER} component={CounterPage} />
              <Route path={routes.HOME} component={HomePage} />
            </Switch>
          </Flex>
        </Flex>
      </ConnectedRouter>
    </Provider>
  </ThemeProvider>
);

export default hot(Root);
