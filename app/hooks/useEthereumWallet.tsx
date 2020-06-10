import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { EthereumWallet } from 'comit-sdk';

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
export const EthereumWalletProvider: React.FunctionComponent = ({
  children
}) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function initializeEthereumWallet() {
      setLoading(true);

      // Needs to support multiple providers
      // TODO: https://github.com/NoahZinsmeister/web3-react
      // TODO: https://github.com/aragon/use-wallet
      const w = new EthereumWallet(
        process.env.ETHEREUM_NODE_HTTP_URL,
        process.env.ETHEREUM_KEY_1
      );
      setWallet(w);

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
