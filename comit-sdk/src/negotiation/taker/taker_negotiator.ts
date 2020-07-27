import { SwapRequest } from "../..";
import { ComitClient } from "../../comit_client";
import { Swap } from "../../swap";
import {
  defaultLedgerParams,
  ExecutionParams,
  isValidExecutionParams
} from "../execution_params";
import { Order } from "../order";
import { MakerClient } from "./maker_client";
import {
  assetOrderToSwap,
  MatchingCriteria,
  matchingCriteriaToTradingPair,
  TakerOrder
} from "./order";

/**
 * Handles the negotiation on the taker side of a trade.
 * Bundles functionality to get orders from a maker, take them and initiate the swap execution.
 */
export class TakerNegotiator {
  private static newSwapRequest(
    rawOrder: Order,
    executionParams: ExecutionParams
  ): undefined | SwapRequest {
    if (!executionParams.ledgers) {
      executionParams.ledgers = defaultLedgerParams();
    }

    const alphaAsset = assetOrderToSwap(rawOrder.ask);
    const alphaLedgerName = rawOrder.ask.ledger;

    const betaAsset = assetOrderToSwap(rawOrder.bid);
    const betaLedgerName = rawOrder.bid.ledger;

    if (alphaAsset && betaAsset) {
      return {
        alpha_ledger: {
          name: alphaLedgerName,
          network: executionParams.ledgers[alphaLedgerName].network,
          chain_id: executionParams.ledgers[alphaLedgerName].chain_id
        },
        alpha_asset: alphaAsset,
        beta_ledger: {
          name: betaLedgerName,
          network: executionParams.ledgers[betaLedgerName].network,
          chain_id: executionParams.ledgers[betaLedgerName].chain_id
        },
        beta_asset: betaAsset,
        alpha_expiry: executionParams.alpha_expiry,
        beta_expiry: executionParams.beta_expiry,
        peer: executionParams.peer
      };
    }
    return undefined;
  }

  private readonly comitClient: ComitClient;
  private readonly makerClient: MakerClient;

  /**
   * @param comitClient The {@link ComitClient} of the taker for swap execution
   * @param makerUrl The url where the maker provides offers according to the {@link MakerNegotiator}
   */
  constructor(comitClient: ComitClient, makerUrl: string) {
    this.comitClient = comitClient;
    this.makerClient = new MakerClient(makerUrl);
  }

  /**
   * Get an order from the maker based on specified criteria. Whatever is returned from the maker is
   * returned here, even if it does not match the criteria or is invalid. Not all criteria are passed to the maker.
   * If it is indeed invalid or mismatching it will not be possible to execute the order, however it gives the
   * opportunity to the lib consumer to know that this maker returns invalid orders and the details of such order.
   * @param criteria - The criteria of the order to be requested from the maker.
   */
  public async getOrder(criteria: MatchingCriteria): Promise<TakerOrder> {
    const tradingPair = matchingCriteriaToTradingPair(criteria);
    const rawOrder = await this.makerClient.getOrderByTradingPair(tradingPair);

    return new TakerOrder(rawOrder, criteria, this.execAndTakeOrder.bind(this));
  }

  private async execAndTakeOrder(order: Order): Promise<Swap | undefined> {
    const executionParams = await this.makerClient.getExecutionParams(order.id);
    if (!isValidExecutionParams(executionParams)) {
      return;
    }

    const swapRequest = TakerNegotiator.newSwapRequest(order, executionParams);
    if (!swapRequest) {
      return;
    }

    const swapHandle = await this.comitClient.sendSwap(swapRequest);

    const swapDetails = await swapHandle.fetchDetails();
    const swapId = swapDetails.properties!.id;
    await this.makerClient.takeOrder(order.id, swapId);
    return swapHandle;
  }
}
