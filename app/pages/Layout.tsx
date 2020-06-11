import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Link } from 'react-router-dom';
import { Flex, PseudoBox, Icon, Stack, Text } from '@chakra-ui/core';
import styled from '@emotion/styled';
import routes from '../constants/routes.json';
import DashboardPage from './DashboardPage';
import HistoryPage from './HistoryPage';
import ExchangePage from './ExchangePage';
import SettingsPage from './SettingsPage';
import CounterPage from './CounterPage';

const NavIcon = styled(Icon)`
  margin-top: -3px;
`;
const NavText = styled(Text)`
  display: inline;
  margin-left: 10px;
  font-size: 0.9em;
  font-weight: 500;
`;
const NavBox = ({ children }) => {
  return (
    <PseudoBox
      as="Box"
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
  return (
    <Flex flexDirection="row" minHeight="100%" alignItems="stretch">
      <Flex backgroundColor="white" id="sidebar">
        <Stack w="200px" spacing="20px">
          <Text fontSize="0.7em" fontWeight="600">
            MENU
          </Text>

          <Stack w="200px">
            <Link to={routes.HOME}>
              <NavBox>
                <NavIcon name="calendar" />
                <NavText>Wallet</NavText>
              </NavBox>
            </Link>
            <Link to={routes.EXCHANGE}>
              <NavBox>
                <NavIcon name="repeat" />
                <NavText>Exchange</NavText>
              </NavBox>
            </Link>
            <Link to={routes.HISTORY}>
              <NavBox>
                <NavIcon name="repeat-clock" />
                <NavText>History</NavText>
              </NavBox>
            </Link>
            <Link disabled to={routes.COUNTER}>
              <NavBox>
                <NavIcon style={{ opacity: '0.4' }} name="download" />
                <NavText style={{ opacity: '0.4' }}>Buy Crypto</NavText>
              </NavBox>
            </Link>
            <Link to={routes.SETTINGS}>
              <NavBox>
                <NavIcon name="settings" />
                <NavText>Settings</NavText>
              </NavBox>
            </Link>
          </Stack>
        </Stack>
      </Flex>
      <Flex backgroundColor="gray.100" id="content">
        <Switch>
          <Route path={routes.EXCHANGE} component={ExchangePage} />
          <Route path={routes.HISTORY} component={HistoryPage} />
          <Route path={routes.SETTINGS} component={SettingsPage} />
          <Route path={routes.COUNTER} component={CounterPage} />
          <Route path={routes.HOME} component={DashboardPage} />
        </Switch>
      </Flex>
    </Flex>
  );
}

NavBox.propTypes = {
  children: PropTypes.node.isRequired
};
