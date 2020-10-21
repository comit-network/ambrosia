import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, useHistory } from 'react-router-dom';
import { Box, PseudoBox } from '@chakra-ui/core';
import routes from '../constants/routes.json';
import DashboardPage from './DashboardPage';
import WelcomePage from './WelcomePage';
import SetupPage from './SetupPage';
import { useConfig } from '../config';
import { Role } from '../utils/swap';

const MenuNavBox = ({ children }) => {
  return (
    <PseudoBox
      as={Box}
      py={3}
      px={4}
      p={3}
      display="block"
      rounded="md"
      _hover={{ bg: 'blue.300', color: 'white', cursor: 'pointer' }}
      _focus={{ boxShadow: 'outline' }}
    >
      {children}
    </PseudoBox>
  );
};

export default function Layout() {
  const [config, setConfig] = useConfig();

  const setupCompleted = config.SETUP_COMPLETE;

  const history = useHistory();

  useEffect(() => {
    if (!setupCompleted) {
      history.push(routes.WELCOME);
    }
  }, [setupCompleted]);

  return (
    <Switch>
      <Route path={routes.WELCOME} component={WelcomePage} />
      <Route
        path={routes.SETUP}
        render={props => (
          <SetupPage
            {...props}
            onComplete={values => {
              setConfig({
                CND_URL: values.cndEndpoint,
                BITCOIND_ENDPOINT: values.bitcoinRpcEndpoint,
                WEB3_ENDPOINT: values.web3Endpoint,
                LEDGER_BITCOIN_ACCOUNT_INDEX: values.bitcoinLedgerAccountIndex,
                LEDGER_ETHEREUM_ACCOUNT_INDEX:
                  values.ethereumLedgerAccountIndex,
                LEDGER_ETHEREUM_ACCOUNT_ADDRESS:
                  values.ethereumLedgerAccountAddress,
                ROLE: Role.ALICE,
                SETUP_COMPLETE: true,
                SWAP_POLL_INTERVAL_MS: 15000, // every 15 sec
                // TODO: Set longer interval once we have a solution for rescanning (or add manual refresh button)
                BITCOIN_BALANCE_POLL_INTERVAL_MS: 10000, // every 10 sec
                ETHEREUM_BALANCE_POLL_INTERVAL_MS: 15000 // every 15 sec
              });
              history.push(routes.HOME);
            }}
          />
        )}
      />
      <Route path={routes.HOME} render={() => <DashboardPage />} />
    </Switch>
  );
}

MenuNavBox.propTypes = {
  children: PropTypes.node.isRequired
};
