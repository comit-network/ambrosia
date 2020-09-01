import React, { useEffect,useState } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, Switch , useHistory } from 'react-router-dom';
import {
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  PseudoBox,
  Stack,
  Text,
  useDisclosure
} from '@chakra-ui/core';
import styled from '@emotion/styled';
import routes from '../constants/routes.json';
import AboutPage from './AboutPage';
import WalletPage from './WalletPage';
import DashboardPage from './DashboardPage';
import WelcomePage from './WelcomePage';
import SetupPage from './SetupPage';
import { Config } from '../config';
import ElectronStore from 'electron-store';

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

interface Props {
  settings: Config
}

export default function Layout({settings}: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeContent, setActiveContent] = useState(DASHBOARD);

  const setupCompleted = settings.SETUP_COMPLETE;

  const handleClick = () => {
    onOpen();
  };

  const history = useHistory();

  useEffect(() => {
    if (!setupCompleted) {
      history.push(routes.WELCOME)
    }
  }, [setupCompleted])

  return (
    <Switch>
      <Route path={routes.WELCOME} component={WelcomePage} />
      <Route path={routes.SETUP} render={props => (<SetupPage {...props} onComplete={(values) => {

        const store = new ElectronStore<Config>()
        store.set("BITCOIND_ENDPOINT", values.bitcoinRpcEndpoint);
        store.set("WEB3_ENDPOINT", values.web3Endpoint);
        store.set("LEDGER_BITCOIN_ACCOUNT_INDEX", values.bitcoinLedgerAccountIndex);
        store.set("LEDGER_ETHEREUM_ACCOUNT_INDEX", values.ethereumLedgerAccountIndex);
        store.set("LEDGER_ETHEREUM_ACCOUNT_ADDRESS", values.ethereumLedgerAccountAddress);
        store.set("SETUP_COMPLETE", true);

        history.push(routes.HOME);
      }} />)} />
      <Route render={() => <Flex flexDirection="row" minHeight="100%" alignItems="stretch">
        <Box
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
            <Divider width="40px" />
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
        </Box>
        <Flex backgroundColor="gray.100" id="content">
          <Switch>
            <Route path={routes.ABOUT} component={AboutPage} />
            <Route path={routes.WALLET} render={(props => <WalletPage settings={settings} {...props} />)} />
            <Route path={routes.HOME} render={(props => <DashboardPage settings={settings} {...props} />)} />
          </Switch>
        </Flex>
      </Flex>} />
    </Switch>
  );
}

MenuNavBox.propTypes = {
  children: PropTypes.node.isRequired
};
