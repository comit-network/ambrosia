/**
 * These are the payload for the `/swaps/rfc003` REST API that will be deprecated in favour of the `/swaps` API.
 *
 * The `rfc003` protocol terminology is being deprecated in of `han`, `herc20` and `halight` protocol terminology,
 * this comes with a migration to new endpoints.
 */
import { Asset, Ledger } from "./cnd";
import { EmbeddedRepresentationSubEntity, Entity } from "./siren";

export interface SwapDetails extends Entity {
  properties?: SwapProperties;
}

export interface SwapSubEntity extends EmbeddedRepresentationSubEntity {
  properties?: SwapProperties;
}

export interface SwapProperties {
  /**
   * The id of the swap.
   */
  id: string;
  /**
   * The peer-id of the counterparty of this swap.
   */
  counterparty: string;
  /**
   * The role in which you are participating in this swap.
   */
  role: "Alice" | "Bob";
  /**
   * The cryptographic protocol that is employed in this swap.
   */
  protocol: string;
  /**
   * The status this swap is currently in.
   */
  status: "IN_PROGRESS" | "SWAPPED" | "NOT_SWAPPED" | "INTERNAL_FAILURE";
  /**
   * The parameters of this swap.
   */
  parameters: {
    alpha_asset: Asset;
    alpha_ledger: Ledger;
    beta_asset: Asset;
    beta_ledger: Ledger;
    [k: string]: any;
  };
  /**
   * The detailed state of the swap.
   */
  state?: {
    /**
     * The state of the alpha ledgers regarding the swap.
     */
    alpha_ledger: {
      /**
       * The transaction ID of the deployment transaction on the alpha ledger.
       */
      deploy_tx: string | null;
      /**
       * The transaction ID of the funding transaction on the alpha ledger.
       */
      fund_tx: string | null;
      /**
       * The address of the htlc on the alpha ledger.
       */
      htlc_location: any;
      /**
       * The transaction ID of the redeem transaction on the alpha ledger.
       */
      redeem_tx: string | null;
      /**
       * The transaction ID of the refund transaction on the alpha ledger.
       */
      refund_tx: string | null;
      /**
       * The status of the HTLC on the alpha ledgers.
       */
      status:
        | "NOT_DEPLOYED"
        | "DEPLOYED"
        | "FUNDED"
        | "REDEEMED"
        | "REFUNDED"
        | "INCORRECTLY_FUNDED";
      [k: string]: any;
    };
    /**
     * The state of the beta ledgers regarding the swap.
     */
    beta_ledger: {
      /**
       * The transaction ID of the deployment transaction on the beta ledger.
       */
      deploy_tx: string | null;
      /**
       * The transaction ID of the funding transaction on the beta ledger.
       */
      fund_tx: string | null;
      /**
       * The address of the htlc on the beta ledger.
       */
      htlc_location: any;
      /**
       * The transaction ID of the redeem transaction on the beta ledger.
       */
      redeem_tx: string | null;
      /**
       * The transaction ID of the refund transaction on the beta ledger.
       */
      refund_tx: string | null;
      /**
       * The status of the HTLC on the beta ledgers.
       */
      status:
        | "NOT_DEPLOYED"
        | "DEPLOYED"
        | "FUNDED"
        | "REDEEMED"
        | "REFUNDED"
        | "INCORRECTLY_FUNDED";
      [k: string]: any;
    };
    /**
     * The state created during the communication of the two parties regarding the swap.
     */
    communication: {
      /**
       * The expiry value of the HTLC on the alpha ledgers. The semantic value depends on the ledgers.
       */
      alpha_expiry: number;
      alpha_redeem_identity: string | null;
      alpha_refund_identity: string | null;
      beta_expiry: number;
      beta_redeem_identity: string | null;
      beta_refund_identity: string | null;
      secret_hash: string;
      status: "SENT" | "ACCEPTED" | "DECLINED";
      [k: string]: any;
    };
    [k: string]: any;
  };
  [k: string]: any;
}
