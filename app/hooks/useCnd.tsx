import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Cnd } from 'comit-sdk';

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

interface CndProviderProps {
  url: string;
}

export const CndProvider: React.FunctionComponent<CndProviderProps> = ({
  url,
  children
}) => {
  const [cnd, setCnd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function initializeCnd() {
      setLoading(true);

      const c = new Cnd(url);
      setCnd(c);

      setLoading(false);
      setLoaded(true);
    }
    initializeCnd();
  }, [url]);

  // Public API
  const value = { cnd, loading, loaded };

  return <CndContext.Provider value={value}>{children}</CndContext.Provider>;
};

CndProvider.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export const useCnd = () => useContext(CndContext);
