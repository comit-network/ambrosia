import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ComitClient } from 'comit-sdk';
import { useBitcoinWallet } from './useBitcoinWallet';
import { useEthereumWallet } from './useEthereumWallet';
import { useCnd } from './useCnd';

export const ComitClientContext = createContext({});

export const ComitClientProvider: React.FunctionComponent = ({ children }) => {
  const {
    wallet: bitcoinWallet,
    loaded: bitcoinWalletLoaded
  } = useBitcoinWallet();
  const {
    wallet: ethereumWallet,
    loaded: ethereumWalletLoaded
  } = useEthereumWallet();
  const { cnd, loaded: cndLoaded } = useCnd();

  const [comitClient, setComitClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function initializeComitClient() {
      setLoading(true);

      const cl = new ComitClient(cnd)
        .withBitcoinWallet(bitcoinWallet)
        .withEthereumWallet(ethereumWallet);
      setComitClient(cl);

      setLoading(false);
      setLoaded(true);
    }
    if (bitcoinWalletLoaded && ethereumWalletLoaded && cndLoaded)
      initializeComitClient();
  }, [
    bitcoinWalletLoaded,
    ethereumWalletLoaded,
    cndLoaded,
    cnd,
    bitcoinWallet,
    ethereumWallet
  ]);

  // Public API
  const value = { comitClient, loading, loaded };

  return (
    <ComitClientContext.Provider value={value}>
      {children}
    </ComitClientContext.Provider>
  );
};

ComitClientProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useComitClient = () => useContext(ComitClientContext);
