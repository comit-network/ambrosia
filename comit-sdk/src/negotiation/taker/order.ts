import { BigNumber } from "bignumber.js";
import { Asset } from "../..";
import { Swap } from "../../swap";
import { getToken } from "../../tokens/tokens";
import {
  fromNominal,
  isNative,
  isOrderValid,
  Order as RawOrder,
  OrderAsset
} from "../order";

export interface MatchingCriteria {
  buy: MatchingCriteriaAsset;
  sell: MatchingCriteriaAsset;
  minRate?: number;
}

export interface MatchingCriteriaAsset {
  ledger: string;
  asset: string;
  minNominalAmount?: string;
  maxNominalAmount?: string;
}

export { Order as TakerOrder };

/**
 * Handles an order for the taker. It has helper functions to facilitate the handler of an
 * order by a taker. This should only be instantiated via {@link getOrder} and should not be constructed from
 * scratch.
 */
class Order {
  /**
   * **Note: This should not be used, `Order` should be created by using {@link getOrder}
   * @param rawOrder - The parameters of the order, as received from the maker.
   * @param criteria - The criteria used to filter/retrieve this order.
   * @param takeOrder - Function passed from the {@link TakerNegotiator} to coordinate calls to `cnd` and the maker to effectively
   * take the order and start the atomic swap execution.
   */
  constructor(
    public readonly rawOrder: RawOrder,
    public readonly criteria: MatchingCriteria,
    public readonly takeOrder: (rawOrder: RawOrder) => Promise<Swap | undefined>
  ) {}

  /**
   * @description: Return whether an order matches the passed criteria.
   */
  public matches(): boolean {
    return (
      assetMatches(this.criteria.buy, this.rawOrder.bid) &&
      assetMatches(this.criteria.sell, this.rawOrder.ask) &&
      rateMatches(this.criteria, this.rawOrder)
    );
  }

  /**
   * Check that the order is valid and safe. Ensure that all properties are set and that the expiries
   * are safe. It does not check whether the ledgers/assets are correct, this is done with {@link matches}.
   */
  public isValid(): boolean {
    return isOrderValid(this.rawOrder);
  }

  /**
   * Initiates the swap execution and tells the maker that we are taking this order.
   * Does nothing if the order is invalid or does not match the passed criteria.
   */
  public async take(): Promise<Swap | undefined> {
    if (this.isValid() && this.matches()) {
      return this.takeOrder(this.rawOrder);
    }
  }

  /**
   * Returned the rate of the order offered by the maker.
   */
  public getOfferedRate(): BigNumber {
    return orderRate(this.rawOrder);
  }
}

/**
 * This is only exported for test purposes
 * @param criteria
 * @param rawOrder
 */
export function rateMatches(
  criteria: MatchingCriteria,
  rawOrder: RawOrder
): boolean {
  if (criteria.minRate) {
    const rate = orderRate(rawOrder);
    return rate.isGreaterThanOrEqualTo(criteria.minRate);
  }

  return true;
}

function orderRate(rawOrder: RawOrder): BigNumber {
  const buy = new BigNumber(rawOrder.bid.nominalAmount);
  const sell = new BigNumber(rawOrder.ask.nominalAmount);

  return buy.div(sell);
}

function assetMatches(
  criteriaAsset: MatchingCriteriaAsset,
  orderAsset: OrderAsset
): boolean {
  if (criteriaAsset.minNominalAmount) {
    const minAmount = new BigNumber(criteriaAsset.minNominalAmount);
    if (!minAmount.isLessThanOrEqualTo(orderAsset.nominalAmount)) {
      return false;
    }
  }

  if (criteriaAsset.maxNominalAmount) {
    const maxAmount = new BigNumber(criteriaAsset.maxNominalAmount);
    if (!maxAmount.isGreaterThanOrEqualTo(orderAsset.nominalAmount)) {
      return false;
    }
  }

  return (
    criteriaAsset.asset === orderAsset.asset &&
    criteriaAsset.ledger === orderAsset.ledger
  );
}

export function assetOrderToSwap(orderAsset: OrderAsset): Asset | undefined {
  if (isNative(orderAsset)) {
    const name = orderAsset.asset;
    const quantity = fromNominal(name, orderAsset.nominalAmount);
    if (!quantity) {
      return undefined;
    }
    return {
      name,
      quantity: quantity.toString()
    };
  }

  const token = getToken(orderAsset.asset);
  if (token) {
    const name = token.type.toLowerCase();
    const quantity = fromNominal(name, orderAsset.nominalAmount, token);
    if (!quantity) {
      return undefined;
    }

    return {
      name,
      quantity: quantity.toString(),
      token_contract: token.address
    };
  }

  return undefined;
}

export function matchingCriteriaToTradingPair(
  matchingCriteria: MatchingCriteria
): string {
  return (
    matchingCriteria.sell.ledger +
    "-" +
    matchingCriteria.sell.asset +
    "-" +
    matchingCriteria.buy.ledger +
    "-" +
    matchingCriteria.buy.asset
  );
}
