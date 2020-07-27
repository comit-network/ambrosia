import axios from "axios";
import { ExecutionParams } from "../execution_params";
import { Order } from "../order";

/**
 * A client for the {@link HttpService} exposed by the maker.
 * This client is used by the taker to request and take orders from a maker.
 */
export class MakerClient {
  /**
   * @param makerUrl The URL to reach the maker's {@link HttpService}, see {@link getUrl}
   */
  constructor(private readonly makerUrl: string) {}

  /**
   * Get an {@link Order} from the maker for a given trading pair (e.g. ethereum-ether-bitcoin-bitcoin).
   * @param tradingPair A trading pair (e.g. ETH-BTC).
   */
  public async getOrderByTradingPair(tradingPair: string): Promise<Order> {
    const response = await axios.get(`${this.makerUrl}orders/${tradingPair}`);
    return response.data;
  }

  /**
   * Get the execution parameters of the maker for a certain {@link Order}.
   * @param orderId The id of an {@link Order} as received by the maker.
   */
  public async getExecutionParams(orderId: string): Promise<ExecutionParams> {
    const response = await axios.get(
      `${this.makerUrl}orders/${orderId}/executionParams`
    );
    return response.data;
  }

  /**
   * Tells the maker that we are taking this order and what is the swap id of the swap request sent for
   * this order from taker cnd to maker cnd.
   * @param orderId - The id of the order that is taken.
   * @param swapId - To facilitate matching between swap requests and orders, the taker first tells their
   * cnd to send a swap request to the maker's cnd, then use the unique swap id, known by both cnds, to tell the maker
   * that it is taking the order and what swap request is being use for this order. While this facilitates the
   * order-to-swap matching logic on the maker's side, the maker still needs to double check the parameters of the swap.
   */
  public async takeOrder(orderId: string, swapId: string): Promise<void> {
    const response = await axios.post(
      `${this.makerUrl}orders/${orderId}/take`,
      { swapId }
    );
    return response.data;
  }
}
