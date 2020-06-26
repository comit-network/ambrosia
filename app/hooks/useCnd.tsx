import React, { createContext, useState, useContext, useEffect } from 'react';
import { Cnd } from 'comit-sdk';
import Store from 'electron-store';

interface CndContextProps {
  cnd: Cnd;
  loading: boolean;
  loaded: boolean;
}

export const CndContext = createContext<CndContextProps>({
  cnd: null,
  loading: false,
  loaded: false
});

export interface CndProviderProps {
  settings: Store;
}

export const CndProvider: React.FunctionComponent<CndProviderProps> = ({
  settings,
  children
}) => {
  const [cnd, setCnd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function initializeCnd() {
      setLoading(true);

      const c = new Cnd(settings.get('HTTP_URL_CND'));
      setCnd(c);

      setLoading(false);
      setLoaded(true);
    }
    initializeCnd();
  }, []);

  // Public API
  const value = { cnd, loading, loaded };

  return <CndContext.Provider value={value}>{children}</CndContext.Provider>;
};

export const useCnd = () => useContext(CndContext);
