import _ from 'lodash';
import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Store from 'electron-store';
import App from './App';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import readComitScriptsEnv from './utils/readComitScriptsEnv';

const reduxStore = configureStore();

// TEMPORARY: loads environment from ~/.create-comit-app/env
function initAppSettings(): Store {
  const comitEnv = readComitScriptsEnv();
  const settings = new Store();
  if (!_.isEmpty(comitEnv)) {
    settings.set('BITCOIN_HD_KEY', comitEnv.BITCOIN_HD_KEY_1);
    settings.set('BITCOIN_P2P_URI', comitEnv.BITCOIN_P2P_URI);
    settings.set('ETHEREUM_KEY', comitEnv.ETHEREUM_KEY_1);
    settings.set('ETHEREUM_NODE_HTTP_URL', comitEnv.ETHEREUM_NODE_HTTP_URL);
    settings.set('ERC20_CONTRACT_ADDRESS', comitEnv.ERC20_CONTRACT_ADDRESS);
    settings.set('HTTP_URL_CND', comitEnv.HTTP_URL_CND_1);

    // TEMP: load Maker settings for testing purposes
    settings.set('MAKER_ETHEREUM_KEY', comitEnv.ETHEREUM_KEY_0);
    settings.set('MAKER_BITCOIN_HD_KEY', comitEnv.BITCOIN_HD_KEY_0);
    settings.set('MAKER_HTTP_URL_CND', comitEnv.HTTP_URL_CND_0);
  } else {
    console.log('No comit env found');
  }
  return settings;
}

// TODO: convert this into a provider
const settings = initAppSettings();
const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () =>
  render(
    <AppContainer>
      <App store={reduxStore} history={history} settings={settings} />
    </AppContainer>,
    document.getElementById('root')
  )
);
