import React, { createContext, useState, useContext, useEffect } from 'react';
// import { InMemoryBitcoinWallet } from 'comit-sdk';
import Store from 'electron-store';

interface BitcoinWalletContextProps {
  wallet: InMemoryBitcoinWallet;
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
  const [wallet, setWallet] = useState({});
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function initializeBitcoinWallet() {
      setLoading(true);

      // TODO: upgrade SDK to 0.17.0
      // https://github.com/comit-network/comit-js-sdk/blob/dev/src/wallet/bitcoin.ts#L71-L79
      // const w = await InMemoryBitcoinWallet.newInstance(
      //   'regtest',
      //   settings.get('BITCOIN_P2P_URI'),
      //   settings.get('BITCOIN_HD_KEY')
      // );
      // await new Promise(resolve => setTimeout(resolve, 1000)); // bitcoin wallet workaround

      // setWallet(w);

      setLoading(false);
      setLoaded(true);
    }
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
