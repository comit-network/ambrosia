import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import './app.global.css';
import { Config, fromComitEnv } from './config';
import { LedgerBitcoinWallet } from './hooks/useLedgerBitcoinWallet';
import { LedgerClient } from './ledgerIpc';
import { ipcRenderer } from 'electron';
import { createBrowserHistory } from 'history';
import * as Sentry from '@sentry/react';
import { captureException, showReportDialog } from '@sentry/react';
import { _IS_SENTRY, _SENTRY_URL } from './constants/sentry';

if (process.env.NODE_ENV === 'production' && _IS_SENTRY) {
  Sentry.init({
    dsn: `${_SENTRY_URL}`
  });
}

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

ipcRenderer.on('USER_ERROR_REPORT', () => {
  const error = new Error('Submit user feedback');
  captureException(error);
  showReportDialog({
    title: 'Something went wrong? Tell us.',
    subtitle: 'If you need help please provide your email',
    subtitle2: '',
    labelSubmit: 'Send to COMIT team',
    successMessage:
      'Report successfully sent, we will get back to you as soon as possible.'
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  // eslint-disable-next-line global-require
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const App = require('./App').default;

  const comitEnvConfig = fromComitEnv();
  if (comitEnvConfig && process.env.NODE_ENV === 'development') {
    console.info(
      'Running in development mode using comit-scripts, creating Bitcoin wallet ...'
    );
    await importDescriptorOfDanielsLedger(comitEnvConfig).catch(console.error);
    document.title += ` - ${comitEnvConfig.ROLE}`;
  }

  const history = createBrowserHistory();

  render(
    <AppContainer>
      <App comitEnvConfig={comitEnvConfig} history={history} />
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
  const ledgerBitcoinWallet = new LedgerBitcoinWallet(
    new LedgerClient(ipcRenderer),
    config.LEDGER_BITCOIN_ACCOUNT_INDEX,
    config.BITCOIND_ENDPOINT
  );

  switch (config.LEDGER_BITCOIN_ACCOUNT_INDEX) {
    case 0: {
      await ledgerBitcoinWallet.createWallet({
        internal:
          "wpkh([47036c27/84'/1'/0']tpubDDTJSQZQhRLcz2dTxYZRDCvj8SdHgYfkcxfkrq6rgPRNrXhxfYDmMrifgZS6qzxrsRqMQrsLjpwewfMZJbcRScV9MHy8RJvf83Vv3v4fn2g/0/*)#cyp75tc5",
        external:
          "wpkh([47036c27/84'/1'/0']tpubDDTJSQZQhRLcz2dTxYZRDCvj8SdHgYfkcxfkrq6rgPRNrXhxfYDmMrifgZS6qzxrsRqMQrsLjpwewfMZJbcRScV9MHy8RJvf83Vv3v4fn2g/1/*)#fsylf7gv"
      });
      break;
    }
    case 1: {
      await ledgerBitcoinWallet.createWallet({
        internal:
          "wpkh([47036c27/84'/1'/1']tpubDDtiy5S8cPAEjdDBhNuPMKSAEzeXQg7Dc4vD9mboF29xyPQ1caADKoamrVRKykj6rMD5GGKp5oUg6d1gKfGovQX5L258v7SMYYou6tHqmjD/1/*)#dmf97w55",
        external:
          "wpkh([47036c27/84'/1'/1']tpubDDtiy5S8cPAEjdDBhNuPMKSAEzeXQg7Dc4vD9mboF29xyPQ1caADKoamrVRKykj6rMD5GGKp5oUg6d1gKfGovQX5L258v7SMYYou6tHqmjD/0/*)#u0vyrmyv"
      });
      break;
    }
  }
}
