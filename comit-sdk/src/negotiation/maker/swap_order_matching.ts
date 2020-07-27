import { BigNumber } from "bignumber.js";
import { SwapProperties } from "../..";
import { Asset, Ledger } from "../../cnd/cnd";
import { getToken, Token } from "../../tokens/tokens";
import { fromNominal, isNative, Order, OrderAsset } from "../order";

/**
 * Check that a given swap matches the agreed conditions of an accepted order.
 * See: {@link MakerNegotiator}
 *
 * @param order - The order to check against the swap.
 * @param props - The properties of the the swap to check against the order.
 */
export default function match(order: Order, props: SwapProperties): boolean {
  const params = props.parameters;

  return (
    assetsMatch(order.ask, params.alpha_asset, params.alpha_ledger) &&
    assetsMatch(order.bid, params.beta_asset, params.beta_ledger)
  );
}

function assetsMatch(
  orderAsset: OrderAsset,
  swapAsset: Asset,
  swapLedger: Ledger
): boolean {
  if (isNative(orderAsset)) {
    return (
      swapAsset.name === orderAsset.asset &&
      areAmountsEqual(
        swapAsset.name,
        swapAsset.quantity,
        orderAsset.nominalAmount
      ) &&
      swapLedger.name === orderAsset.ledger
    );
  }

  if (swapLedger.name === "ethereum") {
    const token = getToken(orderAsset.asset);
    if (token) {
      return (
        swapAsset.name.toLowerCase() === token.type.toLowerCase() &&
        areAmountsEqual(
          swapAsset.name,
          swapAsset.quantity,
          orderAsset.nominalAmount,
          token
        )
      );
    }
  }

  return false;
}

function areAmountsEqual(
  asset: string,
  unitAmount: string,
  nominalAmount: string,
  token?: Token
): boolean {
  const amount = fromNominal(asset, nominalAmount, token);

  if (!amount) {
    return false;
  }

  return amount.eq(new BigNumber(unitAmount));
}
