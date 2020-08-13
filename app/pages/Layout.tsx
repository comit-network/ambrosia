import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Link } from 'react-router-dom';
import {Box, Flex, PseudoBox, Icon, Stack, Text, Collapse, Button} from '@chakra-ui/core';
import styled from '@emotion/styled';
import routes from '../constants/routes.json';
import DashboardPage from './DashboardPage';
import HistoryPage from './HistoryPage';
import ExchangePage from './ExchangePage';
import OrderConfirmationPage from './OrderConfirmationPage';
import SwapDetailsPage from './SwapDetailsPage';
import SettingsPage from './SettingsPage';
import AboutPage from './AboutPage';

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
  const [show, setShow] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(10);
  const handleToggle = () => {
    setShow(!show);
    if (show === false) {
      setSidebarWidth(200)
    }
  };

  return (
    <Flex flexDirection="row" minHeight="100%" alignItems="stretch" marginTop={10}>
      <Flex backgroundColor="white" id="sidebar">
        <Stack>
          <Button mt={4} w={10} variantColor="blue" onClick={handleToggle}>
            M
          </Button>
          <Collapse mt={2} isOpen={show} w={sidebarWidth}>
            <Stack spacing="20px">
              {/*<Text fontSize="0.7em" mt={6} fontWeight="600">*/}
              {/*  MENU*/}
              {/*</Text>*/}
              <Stack>
                <Link to={routes.HOME}>
                  <NavBox>
                    <NavIcon name="calendar" />
                    <NavText>Dashboard</NavText>
                  </NavBox>
                </Link>
              </Stack>
            </Stack>
          </Collapse>
        </Stack>
      </Flex>
      <Flex backgroundColor="gray.100" id="content">
        <Switch>
          <Route path={routes.HOME} component={DashboardPage} />
        </Switch>
      </Flex>
    </Flex>
  );
}

NavBox.propTypes = {
  children: PropTypes.node.isRequired
};
