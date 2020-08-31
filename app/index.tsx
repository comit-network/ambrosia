import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import { Config, fromComitEnv } from './config';
import ElectronStore from 'electron-store';

const reduxStore = configureStore();
const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

const store = new ElectronStore<Config>();

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const App = require('./App').default;

  const comitEnvConfig = fromComitEnv();

  // if comit-env is present during development, use that, otherwise load file system config
  const effectiveConfig = comitEnvConfig && process.env.NODE_ENV === 'development' ? comitEnvConfig : store;

  render(
    <AppContainer>
      <App store={reduxStore} history={history} settings={effectiveConfig} />
    </AppContainer>,
    document.getElementById('root')
  );
});
