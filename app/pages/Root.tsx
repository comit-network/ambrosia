import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Switch, Route } from 'react-router-dom';
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
  <Provider store={store}>
    <ConnectedRouter history={history}>
      {/* TODO: <Sidebar> */}
      <Switch>
        <Route path={routes.COUNTER} component={CounterPage} />
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </ConnectedRouter>
  </Provider>
);

export default hot(Root);
