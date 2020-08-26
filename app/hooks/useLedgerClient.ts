import { createContext, useContext } from 'react';
import { LedgerClient } from '../ledgerIpc';

const LedgerContext = createContext(null);

export const LedgerClientProvider = LedgerContext.Provider;

export function useLedgerClient(): LedgerClient {
  return useContext(LedgerContext)
}
