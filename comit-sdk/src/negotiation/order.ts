import { BigNumber } from "bignumber.js";
import { Token } from "../tokens/tokens";

/**
 * The order of a trade as created by the maker through the {@link MakerNegotiator}.
 */
export interface Order {
  id: string;
  validUntil: number;
  bid: OrderAsset;
  ask: OrderAsset;
}

/**
 * Representation of the bid or ask of an {@link Order}.
 */
export interface OrderAsset {
  ledger: string;
  asset: string;

  /**
   * The amount in a human-readable format.
   * Ether for Ethereum (not Wei).
   * Bitcoin for Bitcoin (not Satoshi).
   */
  nominalAmount: string;
}

/**
 * Validates that all fields of an {@link Order} are set correctly.
 * @param order The {@link Order} to be validated.
 * @returns True if all fields of the {@link Order} are set correctl, false otherwise.
 */
export function isOrderValid(order: Order): boolean {
  if (
    !(
      order.ask.ledger &&
      order.ask.asset &&
      order.ask.nominalAmount &&
      order.bid.ledger &&
      order.bid.asset &&
      order.bid.nominalAmount &&
      order.validUntil &&
      order.id
    )
  ) {
    return false;
  }

  const askAmount = new BigNumber(order.ask.nominalAmount, 10);
  const bidAmount = new BigNumber(order.bid.nominalAmount, 10);

  return !askAmount.isNaN() && !bidAmount.isNaN();
}

/**
 * Convert the bid and ask {@link OrderAsset} to the trading-pair string, e.g. ethereum-ether-bitcoin-bitcoin.
 * @param order
 */
export function toTradingPair(order: Order): string {
  return (
    order.ask.ledger +
    "-" +
    order.ask.asset +
    "-" +
    order.bid.ledger +
    "-" +
    order.bid.asset
  );
}

/**
 * Helper function to check if an asset is native (e.g. ether is on Ethereum but erc20 is not).
 * according to the given asset and ledger string.
 * @param asset
 * @param ledger
 */
export function isNative({ asset, ledger }: OrderAsset): boolean {
  return (
    (asset === "bitcoin" && ledger === "bitcoin") ||
    (asset === "ether" && ledger === "ethereum")
  );
}

const BITCOIN_DECIMALS = 8;
const ETHER_DECIMALS = 18;

/**
 * Convert from nominal amount to underlying base unit of an asset, e.g. convert Ether to Wei.
 *
 * @param asset Name of the asset as string (e.g. "ether".
 * @param nominalAmount The nominal amount (e.g. ether amount).
 * @param token Optional parameter for converting ERC20 tokens according to defined {@link Token.decimals}.
 * @returns The base unit amount of the asset (e.g. amount in wei).
 */
export function fromNominal(
  asset: string,
  nominalAmount: string,
  token?: Token
): BigNumber | undefined {
  let decimals = 0;
  switch (asset) {
    case "bitcoin": {
      decimals = BITCOIN_DECIMALS;
      break;
    }
    case "ether": {
      decimals = ETHER_DECIMALS;
      break;
    }
    default: {
      if (token) {
        decimals = token.decimals;
      } else {
        return undefined;
      }
    }
  }
  return new BigNumber(10).pow(decimals).times(nominalAmount);
}
