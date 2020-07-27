import React, { createContext, useState, useContext, useEffect } from 'react';
import Store from 'electron-store';
import { BitcoindWallet } from '../comit-sdk';

interface BitcoinWalletContextProps {
  wallet: BitcoindWallet;
  loading: boolean;
  loaded: boolean;
}

export const BitcoinWalletContext = createContext<BitcoinWalletContextProps>({
  wallet: null,
  loading: false,
  loaded: false
});

export interface BitcoinWalletProviderProps {
  settings: Store;
}

export const BitcoinWalletProvider: React.FC<BitcoinWalletProviderProps> = ({
  settings,
  children
}) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const initializeBitcoinWallet = async () => {
      setLoading(true);

      const url = settings.get('BITCOIN_HTTP_URI');
      const username = settings.get('BITCOIN_USERNAME');
      const password = settings.get('BITCOIN_PASSWORD');
      const walletDescriptor = settings.get('BITCOIN_WALLET');
      const walletName = 'takerui';

      const params = {
        url,
        username,
        password,
        walletDescriptor,
        walletName,
        rescan: true,
        refreshIntervalMs: 10
      };

      let w;
      try {
        w = await BitcoindWallet.newInstance(params);
      } catch (e) {
        console.log(e);
      }

      setWallet(w);
      setLoading(false);
      setLoaded(true);
    };

    initializeBitcoinWallet();
  }, []);

  // Public API
  const value: BitcoinWalletContextProps = { wallet, loading, loaded };

  return (
    <BitcoinWalletContext.Provider value={value}>
      {children}
    </BitcoinWalletContext.Provider>
  );
};

export const useBitcoinWallet = () => useContext(BitcoinWalletContext);
