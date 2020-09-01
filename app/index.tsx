import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import { Config, fromComitEnv, Provider as ConfigProvider } from './config';
import ElectronStore from 'electron-store';
import { LedgerBitcoinWallet } from './hooks/useLedgerBitcoinWallet';
import { LedgerClient } from './ledgerIpc';
import { ipcRenderer } from 'electron';

const reduxStore = configureStore();
const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

const store = new ElectronStore<Config>();

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const App = require('./App').default;

  const comitEnvConfig = fromComitEnv();

  // if comit-env is present during development, use that, otherwise load file system config
  const effectiveConfig = comitEnvConfig && process.env.NODE_ENV === 'development' ? comitEnvConfig : store;

  if (comitEnvConfig && process.env.NODE_ENV === 'development') {
    console.info("Running in development mode using comit-scripts, creating Bitcoin wallet ...");
    importDescriptorOfDanielsLedger(comitEnvConfig);
  }

  render(
    <AppContainer>
      <ConfigProvider value={effectiveConfig}>
        <App store={reduxStore} history={history} />
      </ConfigProvider>
    </AppContainer>,
    document.getElementById('root')
  );
});

/*
 * Imports the descriptors of our testing Ledger into the bitcoind's wallet.
 *
 * Together with the `ComitScripts.toml` config file, this allows us to use the UI without having the Ledger set up on a particular machine.
 */
async function importDescriptorOfDanielsLedger(config: Config) {
  const ledgerBitcoinWallet = new LedgerBitcoinWallet(new LedgerClient(ipcRenderer), config.LEDGER_BITCOIN_ACCOUNT_INDEX, config.BITCOIND_ENDPOINT);
  await ledgerBitcoinWallet.createWallet({
    internal: "wpkh([47036c27/84'/1'/0']tpubDDTJSQZQhRLcz2dTxYZRDCvj8SdHgYfkcxfkrq6rgPRNrXhxfYDmMrifgZS6qzxrsRqMQrsLjpwewfMZJbcRScV9MHy8RJvf83Vv3v4fn2g/0/*)#cyp75tc5",
    external: "wpkh([47036c27/84'/1'/0']tpubDDTJSQZQhRLcz2dTxYZRDCvj8SdHgYfkcxfkrq6rgPRNrXhxfYDmMrifgZS6qzxrsRqMQrsLjpwewfMZJbcRScV9MHy8RJvf83Vv3v4fn2g/1/*)#fsylf7gv"
  });
}
