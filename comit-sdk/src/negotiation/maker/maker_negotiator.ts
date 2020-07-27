import express from "express";
import * as http from "http";
import pTimeout from "p-timeout";
import { ComitClient } from "../../comit_client";
import { TryParams } from "../../swap";
import { sleep } from "../../util/sleep";
import { ExecutionParams } from "../execution_params";
import { isOrderValid, Order, toTradingPair } from "../order";
import orderSwapMatches from "./swap_order_matching";

/**
 * Handles the negotiation on the maker side of a trade.
 * Bundles functionality to create orders for a maker and make them available for the taker.
 */
export class MakerNegotiator {
  private ordersByTradingPair: { [tradingPair: string]: Order } = {};
  private ordersById: { [orderId: string]: Order } = {};
  private readonly executionParams: ExecutionParams;
  private readonly comitClient: ComitClient;
  private readonly tryParams: TryParams;
  private readonly httpService: HttpService;

  /**
   *
   * @param comitClient The {@link ComitClient} of the taker for swap execution.
   * @param executionParams The {@link ExecutionParams} of the maker for swap execution.
   * @param tryParams The {@link TryParams} of the maker for swap execution.
   */
  constructor(
    comitClient: ComitClient,
    executionParams: ExecutionParams,
    tryParams: TryParams
  ) {
    this.executionParams = executionParams;
    this.comitClient = comitClient;
    this.tryParams = tryParams;
    this.httpService = new HttpService(
      this.getOrderById.bind(this),
      this.getExecutionParams.bind(this),
      this.takeOrder.bind(this),
      this.getOrderByTradingPair.bind(this)
    );
  }

  /**
   * Add an Order to the order book.
   * @returns True if the order parameters are valid and were successfully added to the order book, false otherwise.
   * @param order The order to add.
   */
  public addOrder(order: Order): boolean {
    if (!isOrderValid(order)) {
      return false;
    }
    this.ordersByTradingPair[toTradingPair(order)] = order;
    this.ordersById[order.id] = order;
    return true;
  }

  // Below are methods related to the negotiation protocol

  /**
   * Get an {@link Order} by trading pair (e.g. ethereum-ether-bitcoin-bitcoin).
   * @param tradingPair A trading pair (e.g. bitcoin-bitcoin-ethereum-erc20).
   * @returns An {@link Order} or undefined if there is no {@link Order} for the given trading pair.
   */
  public getOrderByTradingPair(tradingPair: string): Order | undefined {
    return this.ordersByTradingPair[tradingPair];
  }

  /**
   * Get an {@link Order} by {@link Order.id}.
   * @param orderId The {@link Order.id}.
   * @returns An {@link Order} or undefined if there is no {@link Order} for the given id.
   */
  public getOrderById(orderId: string): Order | undefined {
    return this.ordersById[orderId];
  }

  /**
   * Get the {@link ExecutionParams} of the maker.
   * @returns The {@link ExecutionParams} of the maker.
   */
  public getExecutionParams(): ExecutionParams {
    return this.executionParams;
  }

  /**
   * Take an order by accepting the swap request on the maker side.
   *
   * This function uses the given swapId and order to find a matching {@link Swap} using the {@link ComitClient}.
   * If a matching {@link Swap} can be found {@link Swap#accept} is called.
   *
   * @param swapId The id of a swap.
   * @param order The order corresponding to the swap.
   */
  public async takeOrder(swapId: string, order: Order): Promise<void> {
    // Fire the auto-accept
    try {
      await this.tryAcceptSwap(swapId, order, this.tryParams);
    } catch (error) {
      console.log("Could not accept the swap", error);
    }
  }
  // End of methods related to the negotiation protocol

  /**
   * @returns The maker's {@link HttpService} URL.
   */
  public getUrl(): string | undefined {
    return this.httpService.getUrl();
  }

  /**
   * Exposes the maker's {@link HttpService} on the given port and hostname.
   * @param port The port where the {@link HttpService} should be exposed.
   * @param hostname Optionally a hostname can be provided as well.
   */
  public async listen(port: number, hostname?: string): Promise<void> {
    return this.httpService.listen(port, hostname);
  }

  private async tryAcceptSwap(
    swapId: string,
    order: Order,
    { maxTimeoutSecs, tryIntervalSecs }: TryParams
  ): Promise<void> {
    return pTimeout(
      this.acceptSwap(swapId, order, tryIntervalSecs),
      maxTimeoutSecs * 1000
    );
  }

  private async acceptSwap(
    swapId: string,
    order: Order,
    tryIntervalSecs: number
  ): Promise<void> {
    while (true) {
      await sleep(tryIntervalSecs * 1000);

      const swap = await this.comitClient.retrieveSwapById(swapId);

      if (!swap) {
        continue;
      }

      const swapDetails = await swap.fetchDetails();

      if (
        swapDetails.properties &&
        orderSwapMatches(order, swapDetails.properties)
      ) {
        return swap.accept(this.tryParams);
      } else {
        console.log(
          "Swap request was malformed, giving up on trying to accept"
        );
        // The swap request is not as expected, no need to try again
        break;
      }
    }
  }
}

/**
 * A simple [express]{@link http://expressjs.com/} HTTP service to allow takers to access the maker's orders.
 */
class HttpService {
  private readonly getOrderById: (orderId: string) => Order | undefined;
  private readonly getExecutionParams: () => ExecutionParams;
  private readonly takeOrder: (swapId: string, order: Order) => void;
  private readonly getOrderByTradingPair: (
    tradingPair: string
  ) => Order | undefined;
  private server: http.Server | undefined;

  constructor(
    getOrderById: (orderId: string) => Order | undefined,
    getExecutionParams: () => ExecutionParams,
    takeOrder: (swapId: string, order: Order) => void,
    getOrderByTradingPair: (tradingPair: string) => Order | undefined
  ) {
    this.getOrderByTradingPair = getOrderByTradingPair;
    this.getOrderById = getOrderById;
    this.getExecutionParams = getExecutionParams;
    this.takeOrder = takeOrder;
    this.server = undefined;
  }

  public async listen(port: number, hostname?: string): Promise<void> {
    const app = express();

    app.use(express.json());

    app.get("/", (_, res) =>
      res.send("MakerNegotiator's Negotiation Service is up and running!")
    );

    app.get("/orders/:tradingPair", async (req, res) => {
      const order = this.getOrderByTradingPair(req.params.tradingPair);
      if (!order) {
        res.status(404).send("Trading pair not found");
      } else {
        res.send(order);
      }
    });

    app.get("/orders/:orderId/executionParams", async (_, res) => {
      res.send(this.getExecutionParams());
    });

    app.post("/orders/:orderId/take", async (req, res) => {
      const order = this.getOrderById(req.params.orderId);
      const body = req.body;

      if (!order) {
        res.status(404).send("Order not found");
      } else if (!body || !body.swapId) {
        res.status(400).send("swapId missing from payload");
      } else {
        res.send(this.takeOrder(body.swapId, order));
      }
    });

    if (hostname) {
      this.server = app.listen(port, hostname, () =>
        console.log(
          `Maker's Negotiation Service is listening on ${hostname}:${port}.`
        )
      );
    } else {
      this.server = app.listen(port, () =>
        console.log(`Maker's Negotiation Service is listening on port ${port}.`)
      );
    }

    // Waiting for the server to start
    let i = 0;
    while (!this.server.listening && i < 10) {
      await sleep(100);
      i++;
    }
    if (!this.server.listening) {
      throw new Error(
        `There was an error starting the http server, is ${port} already in use?`
      );
    }
  }

  public getUrl(): undefined | string {
    if (this.server) {
      const addr = this.server.address();
      if (typeof addr === "string") {
        return addr;
      }
      if (typeof addr === "object") {
        if (addr!.family === "IPv6") {
          return `http://[${addr!.address}]:${addr!.port}`;
        } else {
          return `http://${addr!.address}:${addr!.port}`;
        }
      }
    }
  }
}
