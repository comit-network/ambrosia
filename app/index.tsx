import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Store from 'electron-store';
import App from './App';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import readComitScriptsEnv from './utils/readComitScriptsEnv';

const reduxStore = configureStore();

// TEMPORARY FOR TESTING PURPOSES: load environment from ~/.create-comit-app/env
function initializeSettings() {
  const comitEnv = readComitScriptsEnv();
  const settings = new Store();
  settings.set('BITCOIN_HD_KEY', comitEnv.BITCOIN_HD_KEY_1);
  settings.set('BITCOIN_P2P_URI', comitEnv.BITCOIN_P2P_URI);
  settings.set('ETHEREUM_KEY', comitEnv.ETHEREUM_KEY_1);
  settings.set('ETHEREUM_NODE_HTTP_URL', comitEnv.ETHEREUM_NODE_HTTP_URL);
  settings.set('ERC20_CONTRACT_ADDRESS', comitEnv.ERC20_CONTRACT_ADDRESS);
  settings.set('HTTP_URL_CND', comitEnv.HTTP_URL_CND_1);
}
initializeSettings();
// finish loading environment

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () =>
  render(
    <AppContainer>
      <App store={reduxStore} history={history} />
    </AppContainer>,
    document.getElementById('root')
  )
);
