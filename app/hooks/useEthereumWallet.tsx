import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { EthereumWallet } from 'comit-sdk';
import Store from 'electron-store';

interface EthereumWalletContextProps {
  wallet: EthereumWallet;
  loading: boolean;
  loaded: boolean;
}

export const EthereumWalletContext = createContext<EthereumWalletContextProps>({
  wallet: null,
  loading: false,
  loaded: false
});

// TODO: can add props here for e.g. wallet uris
// ({ params, children })
export const EthereumWalletProvider: React.FC = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function initializeEthereumWallet() {
      setLoading(true);

      const settings = new Store();

      const w = new EthereumWallet(
        settings.get('ETHEREUM_NODE_HTTP_URL'),
        settings.get('ETHEREUM_KEY')
      );
      setWallet(w);

      // const ethBalance = await w.getBalance();
      // console.log(ethBalance.toString());

      setLoading(false);
      setLoaded(true);
    }
    initializeEthereumWallet();
  }, []);

  // Public API
  const value = { wallet, loading, loaded };

  return (
    <EthereumWalletContext.Provider value={value}>
      {children}
    </EthereumWalletContext.Provider>
  );
};

EthereumWalletProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useEthereumWallet = () => useContext(EthereumWalletContext);
