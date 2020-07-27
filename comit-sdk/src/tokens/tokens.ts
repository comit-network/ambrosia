import { definitions } from "./definitions";

export type Type = "ERC20";

export interface Token {
  symbol: string;
  type: Type;
  address: string;
  decimals: number;
}

/**
 * Returns information about an ERC20 token.
 * @returns ERC20 token object.
 * @param symbol - ERC20 ticker symbol.
 */
export function getToken(symbol: string): Token | undefined {
  const defs = definitions as Token[];
  return defs.find((token: Token) => {
    return token.symbol === symbol;
  });
}
