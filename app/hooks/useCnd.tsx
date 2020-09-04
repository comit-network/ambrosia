import { createContext, useContext } from 'react';
import { Cnd } from '../comit-sdk';

export const CndContext = createContext<string>(null);

export const Provider = CndContext.Provider;

export const useCnd = () => {
  const url = useContext(CndContext);
  return new Cnd(url);
};
