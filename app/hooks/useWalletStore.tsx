import React, { createContext, useReducer, useContext } from 'react';
import PropTypes from 'prop-types';
import { BigNumber } from 'comit-sdk';
import { Action } from '../actions/wallet';

interface State {
  BTCBalance: BigNumber | undefined;
  ETHBalance: BigNumber | undefined;
  DAIBalance: BigNumber | undefined;
}

export const defaultState: State = {
  BTCBalance: undefined,
  ETHBalance: undefined,
  DAIBalance: undefined
};

export function reducer(state = defaultState, action: Action): State {
  switch (action.kind) {
    case 'setBTCBalance':
      return { ...state, BTCBalance: action.value };
    case 'setETHBalance':
      return { ...state, ETHBalance: action.value };
    case 'setDAIBalance':
      return { ...state, DAIBalance: action.value };
    default:
      return state;
  }
}

interface ContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
}

export const WalletStoreContext = createContext<ContextValue | null>(null);

// NOTE: can add props here
// ({ params, children })
export const WalletStoreProvider: React.FunctionComponent = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const value = { state, dispatch };

  return (
    <WalletStoreContext.Provider value={value}>
      {children}
    </WalletStoreContext.Provider>
  );
};

WalletStoreProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useWalletStore = () =>
  useContext(WalletStoreContext) as ContextValue;
