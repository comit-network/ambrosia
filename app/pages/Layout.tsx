import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Link } from 'react-router-dom';
import {
  Box,
  Flex,
  PseudoBox,
  Icon,
  Stack,
  Text,
  Drawer,
  useDisclosure,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  IconButton,
  Divider,
  Button, Image
} from '@chakra-ui/core';
import styled from '@emotion/styled';
import routes from '../constants/routes.json';
import AboutPage from './AboutPage';
import WalletPage from './WalletPage';
import DashboardPage from './DashboardPage';
import DashboardPageMock1 from './DashboardPageMock1';
import DashboardPageMock2 from './DashboardPageMock2';
import DashboardPageMock3 from './DashboardPageMock3';
import DashboardPageMock4 from './DashboardPageMock4';
import DashboardPageMock5 from './DashboardPageMock5';
import DashboardPageMock6 from './DashboardPageMock6';

const NavIcon = styled(Icon)`
  margin-top: -3px;
`;
const NavText = styled(Text)`
  display: inline;
  margin-left: 10px;
  font-size: 0.9em;
  font-weight: 500;
`;
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

const DASHBOARD = 'DASHBOARD';
const ABOUT = 'ABOUT';
const WALLET = 'WALLET';

export default function Layout() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeContent, setActiveContent] = useState(DASHBOARD);

  const handleClick = () => {
    onOpen();
  };

  return (
    <Flex flexDirection="row" minHeight="100%" alignItems="stretch">
      <Flex
          direction="column"
        backgroundColor="white"
        id="sidebar"
        borderRight="2px"
        borderColor="gray.200"
      >
        <Stack>
          <IconButton
            aria-label="Menu"
            variantColor="gray"
            onClick={handleClick}
            icon="chevron-right"
            width="20px"
          />
          <Divider />
          <Stack>
            <Link to={routes.HOME}>
              <IconButton
                aria-label="Dashboard"
                variantColor={activeContent === DASHBOARD ? 'blue' : 'gray'}
                icon="calendar"
                onClick={() => setActiveContent(DASHBOARD)}
                marginBottom="10px"
              />
            </Link>
            <Link to={routes.HOME_mock1}>
              <Button
                variantColor={activeContent === 'HOME_mock1' ? 'red' : 'orange'}
                onClick={() => setActiveContent('HOME_mock1')}
                marginBottom="10px"
              >
                1
              </Button>
            </Link>
            <Link to={routes.HOME_mock2}>
              <Button
                variantColor={activeContent === 'HOME_mock2' ? 'red' : 'orange'}
                onClick={() => setActiveContent('HOME_mock2')}
                marginBottom="10px"
              >
                2
              </Button>
            </Link>
            <Link to={routes.HOME_mock3}>
              <Button
                variantColor={activeContent === 'HOME_mock3' ? 'red' : 'orange'}
                onClick={() => setActiveContent('HOME_mock3')}
                marginBottom="10px"
              >
                3
              </Button>
            </Link>
            <Link to={routes.HOME_mock4}>
              <Button
                variantColor={activeContent === 'HOME_mock4' ? 'red' : 'orange'}
                onClick={() => setActiveContent('HOME_mock4')}
                marginBottom="10px"
              >
                4
              </Button>
            </Link>
            <Link to={routes.HOME_mock5}>
              <Button
                variantColor={activeContent === 'HOME_mock5' ? 'red' : 'orange'}
                onClick={() => setActiveContent('HOME_mock5')}
                marginBottom="10px"
              >
                5
              </Button>
            </Link>
            <Link to={routes.HOME_mock6}>
              <Button
                variantColor={activeContent === 'HOME_mock6' ? 'red' : 'orange'}
                onClick={() => setActiveContent('HOME_mock6')}
                marginBottom="10px"
              >
                6
              </Button>
            </Link>
            <Link to={routes.WALLET}>
              <IconButton
                aria-label="Wallet"
                variantColor={activeContent === WALLET ? 'blue' : 'gray'}
                icon="star"
                onClick={() => setActiveContent(WALLET)}
                marginBottom="10px"
              />
            </Link>
            <Link to={routes.ABOUT}>
              <IconButton
                aria-label="About"
                variantColor={activeContent === ABOUT ? 'blue' : 'gray'}
                icon="info"
                onClick={() => setActiveContent(ABOUT)}
                marginBottom="10px"
              />
            </Link>
          </Stack>
          <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="xs">
            <DrawerOverlay />
            <DrawerContent>
              <DrawerHeader marginTop="20px">MENU</DrawerHeader>
              <DrawerBody>
                <Stack spacing="20px">
                  <Link
                    to={routes.HOME}
                    onClick={() => setActiveContent(DASHBOARD)}
                  >
                    <MenuNavBox>
                      <NavIcon name="calendar" />
                      <NavText>Dashboard</NavText>
                    </MenuNavBox>
                  </Link>
                  <Link
                    to={routes.ABOUT}
                    onClick={() => setActiveContent(ABOUT)}
                  >
                    <MenuNavBox>
                      <NavIcon name="info" />
                      <NavText>About</NavText>
                    </MenuNavBox>
                  </Link>
                  <Link
                    to={routes.WALLET}
                    onClick={() => setActiveContent(WALLET)}
                  >
                    <MenuNavBox>
                      <NavIcon name="star" />
                      <NavText>Wallet</NavText>
                    </MenuNavBox>
                  </Link>
                </Stack>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Stack>
      </Flex>
      <Flex backgroundColor="gray.50" id="content">
        <Switch>
          <Route path={routes.ABOUT} component={AboutPage} />
          <Route path={routes.WALLET} component={WalletPage} />
          <Route path={routes.HOME_mock1} component={DashboardPageMock1} />
          <Route path={routes.HOME_mock2} component={DashboardPageMock2} />
          <Route path={routes.HOME_mock3} component={DashboardPageMock3} />
          <Route path={routes.HOME_mock4} component={DashboardPageMock4} />
          <Route path={routes.HOME_mock5} component={DashboardPageMock5} />
          <Route path={routes.HOME_mock6} component={DashboardPageMock6} />
          <Route path={routes.HOME} component={DashboardPage} />
        </Switch>
      </Flex>
    </Flex>
  );
}

MenuNavBox.propTypes = {
  children: PropTypes.node.isRequired
};
