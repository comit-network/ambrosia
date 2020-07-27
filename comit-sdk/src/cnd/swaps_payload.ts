/**
 * These are the payload for the `/swaps/` REST API that supports halight swaps (lightning) and that will replace
 * the `/swaps/rfc003` endpoint once all other swaps pair are supported.
 */

import { Asset, Ledger, Peer } from "./cnd";
import { Action, EmbeddedRepresentationSubEntity, Entity, Link } from "./siren";

/**
 * The parameters that the two parties have agreed on for swap execution.
 *
 * The swap request is sent by the party in the role of Alice to initiate a swap with Bob.
 */
export interface SwapRequest {
  alpha_ledger: Ledger;
  alpha_asset: Asset;
  beta_ledger: Ledger;
  beta_asset: Asset;
  alpha_expiry?: number;
  beta_expiry?: number;
  alpha_ledger_refund_identity?: string;
  beta_ledger_redeem_identity?: string;
  peer: Peer;
}

interface CoreRequestBody<A, B> {
  alpha: A;
  beta: B;
  role: "Alice" | "Bob";
  peer: Peer;
}

interface RequestParams {
  amount: string;
  identity: string;
}

interface Herc20Request {
  contract_address: string;
  absolute_expiry: number;
}

interface HalightRequest {
  cltv_expiry: number;
  network: string;
}

interface BitcoinRequest {
  absolute_expiry: number;
  network: string;
}

interface EthereumRequest {
  chain_id: number;
}

export type HbitRequestParams = RequestParams & BitcoinRequest;

export type HalightRequestParams = RequestParams & HalightRequest;

export type Herc20RequestParams = RequestParams &
  Herc20Request &
  EthereumRequest;

export type Herc20HalightRequestBody = CoreRequestBody<
  Herc20RequestParams,
  HalightRequestParams
>;

export type HalightHerc20RequestBody = CoreRequestBody<
  HalightRequestParams,
  Herc20RequestParams
>;

export type Herc20HbitRequestBody = CoreRequestBody<
  Herc20RequestParams,
  HbitRequestParams
>;

export type HbitHerc20RequestBody = CoreRequestBody<
  HbitRequestParams,
  Herc20RequestParams
>;

/**
 * The payload returned when fetching one swap on the `/swaps/:id` endpoint
 */
export interface SwapResponse extends Entity {
  properties: Properties;
  entities: Array<LedgerState | LedgerParameters>;
  actions: SwapAction[];
  /**
   * links for this swap, contains a self reference
   */
  links: Link[];
}

/**
 * Element of the array in the payload returned when fetching all swaps on the `/swaps/` endpoint
 */
export interface SwapElementResponse extends EmbeddedRepresentationSubEntity {
  properties: Properties;
  entities: Array<LedgerState | LedgerParameters>;
  actions: SwapAction[];
  /**
   * links for this swap, contains a self reference
   */
  links: Link[];
}

/**
 * The properties of a swap
 */
export interface Properties {
  // id: string; // No id! The id should not be manipulated by the client, navigation should be done using the `links` property.
  /**
   * The status this swap is currently in.
   */
  status: SwapStatus;
  /**
   * The role in which you are participating in this swap.
   */
  role: "Alice" | "Bob";
}

/**
 * The overall status of a swap
 */
export enum SwapStatus {
  /**
   * The swap was created but the communication phase hasn't yet been finalized
   */
  Created = "CREATED",
  /**
   * The communication was finalized and blockchain actions are needed or happening
   */
  InProgress = "IN_PROGRESS",
  /**
   * The swap is finished and the assets were swapped
   */
  Swapped = "SWAPPED",
  /**
   * The swap is finished and the assets were not swapped
   */
  NotSwapped = "NOT_SWAPPED",
  /**
   * An unexpected internal failure aborted the swap
   */
  InternalFailure = "INTERNAL_FAILURE"
}

/**
 * The parameters of a given ledger
 */
export interface LedgerParameters extends EmbeddedRepresentationSubEntity {
  /**
   * The relation of these ledger parameters to the parent object (*SwapProperties).
   */
  rel: ["alpha" | "beta"];
  /**
   * Human readable title.
   */
  title: "Parameters of the Alpha Ledger" | "Parameters of the Beta Ledger";
  /**
   * Class of this sub-entity to facilitate parsing.
   */
  class: ["parameters"];
  properties: HanEthereum | HanBitcoin | Herc20 | HalightBitcoin;
}

export interface HanEthereum {
  protocol: "han-ethereum";
  /**
   * Quantity in wei
   */
  quantity: string;
}

export interface HanBitcoin {
  protocol: "han-bitcoin";
  /**
   * Quantity in satoshi
   */
  quantity: string;
}

export interface Herc20 {
  protocol: "herc20";
  /**
   * Quantity in wei
   */
  quantity: string;
  contract_address: string;
}

export interface HalightBitcoin {
  /**
   * Quantity in satoshi
   */
  protocol: "halight-bitcoin";
}

/**
 * The detailed description of the ledger state.
 */
export interface LedgerState extends EmbeddedRepresentationSubEntity {
  /**
   * The relation of this ledger state to the parent object (*SwapProperties).
   */
  rel: ["alpha" | "beta"];
  /**
   * Human readable title.
   */
  title: "State of the Alpha Ledger" | "State of the Beta Ledger";
  /**
   * Class of this sub-entity to facilitate parsing.
   */
  class: ["state"];
  // htlc_location?: any; // Not included because the user can search the deploy or fund tx in an explorer to find it.

  properties: {
    /**
     * Blockchain Transactions
     */
    transactions: StepTransaction[];
    /**
     * The status of the escrow (HTLC or Invoice).
     */
    status: EscrowStatus;
  };
}

/**
 * The blockchain transactions related to a given step.
 */
export type StepTransaction = {
  /**
   * List the transaction related to the swap by step, if applicable.
   *
   * Key is the step, value is the transaction id
   */
  [k in Step]: string;
};

/**
 * The status of the escrow (htlc, lightning invoice, etc) on the ledger.
 */
export enum EscrowStatus {
  /**
   * The escrow does not exist yet.
   */
  None = "NONE",
  /**
   * The escrow has been initialized.
   *
   * Initialization is a step that does not endure any cost to the user.
   */
  Initialized = "INITIALIZED",
  /**
   * The escrow has been deployed.
   *
   * Deployment is a step that endures some, relatively small, cost to the user due to computation needed on the blockchain.
   */
  Deployed = "DEPLOYED",
  /**
   * The escrow has been funded.
   *
   * Funding is a step where all the assets to be sold are sent and locked in the escrow.
   */
  Funded = "FUNDED",
  /**
   * The assets have been redeemed from the escrow.
   *
   * Redemption is a step where all the assets to be acquired are received from the escrow.
   */
  Redeemed = "REDEEMED",
  /**
   * The assets have been refunded from the escrow.
   *
   * Refunding is a step where all the assets to be sold are received back from the escrow, meaning the swap has been aborted.
   */
  Refunded = "REFUNDED",
  /**
   * An incorrect amount of assets have been sent to the escrow.
   *
   * To protect the user, if an incorrect amount of asset have been sent to the escrow, cnd will not propose redemption
   * as an option and only the refund actions will be available down the line.
   */
  IncorrectlyFunded = "INCORRECTLY_FUNDED"
}

/**
 * The possible steps needed on each side of the swap for its execution.
 *
 * Not all steps are needed for all protocols and ledgers.
 * E.g. for Han Bitcoin the steps are: fund, redeem (or refund)
 */
export enum Step {
  Init = "init",
  Deploy = "deploy",
  Fund = "fund",
  Redeem = "redeem",
  Refund = "refund"
}

/**
 * An action that is available for the given swap.
 */
export interface SwapAction extends Action {
  name: Step;
}
