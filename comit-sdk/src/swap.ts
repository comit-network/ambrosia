import { AxiosResponse } from "axios";
import { BigNumber } from "bignumber.js";
import pTimeout from "p-timeout";
import { Action } from "./action";
import { LedgerAction } from "./cnd/action_payload";
import { Cnd, ledgerIsEthereum } from "./cnd/cnd";
import { SwapDetails } from "./cnd/rfc003_payload";
import { Action as SirenAction, Field } from "./cnd/siren";
import { SwapResponse } from "./cnd/swaps_payload";
import { Transaction } from "./transaction";
import { sleep } from "./util/sleep";
import { AllWallets, Wallets } from "./wallet";

export class WalletError extends Error {
  constructor(
    public readonly attemptedAction: string,
    public readonly source: Error,
    public readonly callParams: any
  ) {
    super(source.message);
  }
}

/**
 * A stateful class that represents a single swap.
 *
 * It has all the dependencies embedded that are necessary for taking actions on the swap.
 */
export class Swap {
  private readonly wallets: Wallets;

  constructor(
    private readonly cnd: Cnd,
    readonly self: string,
    wallets: AllWallets
  ) {
    this.wallets = new Wallets(wallets);
  }

  /**
   * Retrieves the next recommended action of this {@link Swap} if there is any.
   *
   * @returns An {@link Action} that can be executed or null if no action is currently recommended.
   */
  public async nextAction(): Promise<Action | null> {
    const actions = await this.cnd
      .fetch<SwapResponse>(this.self)
      .then(response => response.data.actions);

    if (!actions || actions.length === 0) {
      return null;
    }

    if (actions.length !== 1) {
      throw new Error(
        "Several actions returned by cnd, be sure to use cnd version 0.8.0 or above."
      );
    }

    return new Action(actions[0], this);
  }

  /**
   * Looks for and executes the accept action of this {@link Swap}.
   * If the {@link Swap} is not in the right state this call will throw a timeout exception.
   *
   * @param tryParams Controls at which stage the exception is thrown.
   * @throws A {@link Problem} from the cnd REST API or an {@link Error}.
   */
  public async accept(tryParams: TryParams): Promise<void> {
    await this.tryExecuteSirenAction<void>("accept", tryParams);
  }

  /**
   * Looks for and executes the decline action of this {@link Swap}.
   * If the {@link Swap} is not in the right state this call will throw a timeout exception.
   *
   * @param tryParams Controls at which stage the exception is thrown.
   * @throws A {@link Problem} from the cnd REST API or an {@link Error}.
   */
  public async decline(tryParams: TryParams): Promise<void> {
    await this.tryExecuteSirenAction<void>("decline", tryParams);
  }

  /**
   * Looks for and executes the deploy action of this {@link Swap}.
   * If the {@link Swap} is not in the right state this call will throw a timeout exception.
   *
   * This is only valid for ERC20 swaps.
   *
   * @param tryParams Controls at which stage the exception is thrown.
   * @returns The hash of the transaction that was sent to the blockchain network.
   * @throws A {@link Problem} from the cnd REST API, or {@link WalletError} if the blockchain wallet throws, or an {@link Error}.
   */
  public async deploy(tryParams: TryParams): Promise<Transaction | string> {
    const response = await this.tryExecuteSirenAction<LedgerAction>(
      "deploy",
      tryParams
    );
    return this.doLedgerAction(response.data);
  }

  /**
   * Looks for and executes the fund action of this {@link Swap}.
   * If the {@link Swap} is not in the right state this call will throw a timeout exception.
   *
   * @param tryParams Controls at which stage the exception is thrown.
   * @returns The hash of the transaction that was sent to the blockchain network.
   * @throws A {@link Problem} from the cnd REST API, or {@link WalletError} if the blockchain wallet throws, or an {@link Error}.
   */
  public async fund(tryParams: TryParams): Promise<Transaction | string> {
    const response = await this.tryExecuteSirenAction<LedgerAction>(
      "fund",
      tryParams
    );
    return this.doLedgerAction(response.data);
  }

  /**
   * Looks for and executes the redeem action of this {@link Swap}.
   * If the {@link Swap} is not in the right state this call will throw a timeout exception.
   *
   * @param tryParams Controls at which stage the exception is thrown.
   * @returns The hash of the transaction that was sent to the blockchain network.
   * @throws A {@link Problem} from the cnd REST API, or {@link WalletError} if the blockchain wallet throws, or an {@link Error}.
   */
  public async redeem(tryParams: TryParams): Promise<Transaction | string> {
    const response = await this.tryExecuteSirenAction<LedgerAction>(
      "redeem",
      tryParams
    );
    return this.doLedgerAction(response.data);
  }

  /**
   * Looks for and executes the refund action of this {@link Swap}.
   * If the {@link Swap} is not in the right state this call will throw a timeout exception.
   *
   * @param tryParams Controls at which stage the exception is thrown.
   * @returns The result of the refund action, a hash of the transaction that was sent to the blockchain.
   * @throws A {@link Problem} from the cnd REST API, or {@link WalletError} if the blockchain wallet throws, or an {@link Error}.
   */
  public async refund(tryParams: TryParams): Promise<Transaction | string> {
    const response = await this.tryExecuteSirenAction<LedgerAction>(
      "refund",
      tryParams
    );
    return this.doLedgerAction(response.data);
  }

  /**
   * Fetch the details of a swap.
   *
   * @return The details of the swap are returned by cnd REST API.
   * @throws A {@link Problem} from the cnd REST API or an {@link Error}.
   */
  public async fetchDetails(): Promise<SwapDetails> {
    const response = await this.cnd.fetch<SwapDetails>(this.self);
    return response.data;
  }

  /**
   * Low level API for executing actions on the {@link Swap}.
   *
   * If you are using any of the above actions ({@link Swap.redeem}, etc) you shouldn't need to use this.
   * This only performs an action on the CND REST API, if an action is needed on another system (e.g blockchain wallet),
   * then the needed information is returned by this function and needs to be processed with {@link doLedgerAction}.
   *
   * @param actionName The name of the Siren action you want to execute.
   * @param tryParams Controls at which stage the exception is thrown.
   * @returns The response from {@link Cnd}. The actual response depends on the action you executed (hence the
   * type parameter).
   * @throws A {@link Problem} from the cnd REST API, or {@link WalletError} if the blockchain wallet throws, or an {@link Error}.
   */
  public async tryExecuteSirenAction<R>(
    actionName: string,
    { maxTimeoutSecs, tryIntervalSecs }: TryParams
  ): Promise<AxiosResponse<R>> {
    return pTimeout(
      this.executeAvailableAction(actionName, tryIntervalSecs),
      maxTimeoutSecs * 1000
    );
  }

  /**
   * Low level API for executing a ledger action returned from {@link Cnd}.
   *
   * Uses the wallets given in the constructor to send transactions according to the given ledger action.
   *
   * @param ledgerAction The ledger action returned from {@link Cnd}.
   * @throws A {@link WalletError} if a wallet or blockchain action failed.
   */
  public async doLedgerAction(
    ledgerAction: LedgerAction
  ): Promise<Transaction | string> {
    switch (ledgerAction.type) {
      case "bitcoin-broadcast-signed-transaction": {
        const { hex, network } = ledgerAction.payload;

        try {
          const transactionId = await this.wallets.bitcoin.broadcastTransaction(
            hex,
            network
          );
          return new Transaction(
            { bitcoin: this.wallets.bitcoin },
            transactionId
          );
        } catch (error) {
          throw new WalletError(ledgerAction.type, error, { hex, network });
        }
      }
      case "bitcoin-send-amount-to-address": {
        const { to, amount, network } = ledgerAction.payload;
        const sats = parseInt(amount, 10);

        try {
          const transactionId = await this.wallets.bitcoin.sendToAddress(
            to,
            sats,
            network
          );
          return new Transaction(
            { bitcoin: this.wallets.bitcoin },
            transactionId
          );
        } catch (error) {
          throw new WalletError(ledgerAction.type, error, {
            to,
            sats,
            network
          });
        }
      }
      case "ethereum-call-contract": {
        const {
          data,
          contract_address,
          gas_limit,
          chain_id
        } = ledgerAction.payload;

        try {
          const transactionId = await this.wallets.ethereum.callContract(
            data,
            contract_address,
            gas_limit,
            chain_id
          );
          return new Transaction(
            { ethereum: this.wallets.ethereum },
            transactionId
          );
        } catch (error) {
          throw new WalletError(ledgerAction.type, error, {
            data,
            contract_address,
            gas_limit
          });
        }
      }
      case "ethereum-deploy-contract": {
        const { amount, data, gas_limit, chain_id } = ledgerAction.payload;
        const value = new BigNumber(amount);

        try {
          const transactionId = await this.wallets.ethereum.deployContract(
            data,
            value,
            gas_limit,
            chain_id
          );
          return new Transaction(
            { ethereum: this.wallets.ethereum },
            transactionId
          );
        } catch (error) {
          throw new WalletError(ledgerAction.type, error, {
            data,
            value,
            gas_limit
          });
        }
      }
      case "lnd-send-payment": {
        const {
          self_public_key,
          to_public_key,
          amount,
          secret_hash,
          final_cltv_delta,
          chain,
          network
        } = ledgerAction.payload;

        try {
          await this.wallets.lightning.assertLndDetails(
            self_public_key,
            chain,
            network
          );

          await this.wallets.lightning.sendPayment(
            to_public_key,
            amount,
            secret_hash,
            final_cltv_delta
          );

          return secret_hash;
        } catch (error) {
          throw new WalletError(ledgerAction.type, error, {
            self_public_key,
            to_public_key,
            amount,
            secret_hash,
            final_cltv_delta,
            chain,
            network
          });
        }
      }
      case "lnd-add-hold-invoice": {
        const {
          self_public_key,
          amount,
          secret_hash,
          expiry,
          cltv_expiry,
          chain,
          network
        } = ledgerAction.payload;

        try {
          await this.wallets.lightning.assertLndDetails(
            self_public_key,
            chain,
            network
          );

          return this.wallets.lightning.addHoldInvoice(
            amount,
            secret_hash,
            expiry,
            cltv_expiry
          );
        } catch (error) {
          throw new WalletError(ledgerAction.type, error, {
            self_public_key,
            amount,
            secret_hash,
            expiry,
            cltv_expiry,
            chain,
            network
          });
        }
      }
      case "lnd-settle-invoice": {
        const {
          self_public_key,
          secret,
          chain,
          network
        } = ledgerAction.payload;
        try {
          await this.wallets.lightning.assertLndDetails(
            self_public_key,
            chain,
            network
          );

          await this.wallets.lightning.settleInvoice(secret);

          return secret;
        } catch (error) {
          throw new WalletError(ledgerAction.type, error, {
            self_public_key,
            secret,
            chain,
            network
          });
        }
      }
      default:
        throw new Error(`Cannot handle ${ledgerAction.type}`);
    }
  }

  /**
   * Get the Alpha deploy transaction.
   *
   * @returns null if cnd hasn't seen a deploy transaction, otherwise, {@link Transaction} if supported or the transaction id as string.
   */
  public async getAlphaDeployTransaction(): Promise<
    Transaction | string | null
  > {
    const details = await this.fetchDetails();
    const transactionId = details.properties!.state!.alpha_ledger!.deploy_tx;
    return this.getTransaction(details, transactionId);
  }

  /**
   * Get the Alpha Fund transaction.
   *
   * @returns null if cnd hasn't seen a funding transaction, otherwise, {@link Transaction} if supported or the transaction id as string.
   */
  public async getAlphaFundTransaction(): Promise<Transaction | string | null> {
    const details = await this.fetchDetails();
    const transactionId = details.properties!.state!.alpha_ledger!.fund_tx;
    return this.getTransaction(details, transactionId);
  }

  /**
   * Get the Alpha Redeem transaction.
   *
   * @returns null if cnd hasn't seen a redeem transaction, otherwise, {@link Transaction} if supported or the transaction id as string.
   */
  public async getAlphaRedeemTransaction(): Promise<
    Transaction | string | null
  > {
    const details = await this.fetchDetails();
    const transactionId = details.properties!.state!.alpha_ledger!.redeem_tx;
    return this.getTransaction(details, transactionId);
  }

  /**
   * Get the Alpha Refund transaction.
   *
   * @returns null if cnd hasn't seen a refund transaction, otherwise, {@link Transaction} if supported or the transaction id as string.
   */
  public async getAlphaRefundTransaction(): Promise<
    Transaction | string | null
  > {
    const details = await this.fetchDetails();
    const transactionId = details.properties!.state!.alpha_ledger!.refund_tx;
    return this.getTransaction(details, transactionId);
  }

  /**
   * Get the Beta deploy transaction.
   *
   * @returns null if cnd hasn't seen a deploy transaction, otherwise, {@link Transaction} if supported or the transaction id as string.
   */
  public async getBetaDeployTransaction(): Promise<
    Transaction | string | null
  > {
    const details = await this.fetchDetails();
    const transactionId = details.properties!.state!.beta_ledger!.deploy_tx;
    return this.getTransaction(details, transactionId);
  }

  /**
   * Get the Beta Fund transaction.
   *
   * @returns null if cnd hasn't seen a funding transaction, otherwise, {@link Transaction} if supported or the transaction id as string.
   */
  public async getBetaFundTransaction(): Promise<Transaction | string | null> {
    const details = await this.fetchDetails();
    const transactionId = details.properties!.state!.beta_ledger!.fund_tx;
    return this.getTransaction(details, transactionId);
  }

  /**
   * Get the Beta Redeem transaction.
   *
   * @returns null if cnd hasn't seen a redeem transaction, otherwise, {@link Transaction} if supported or the transaction id as string.
   */
  public async getBetaRedeemTransaction(): Promise<
    Transaction | string | null
  > {
    const details = await this.fetchDetails();
    const transactionId = details.properties!.state!.beta_ledger!.redeem_tx;
    return this.getTransaction(details, transactionId);
  }

  /**
   * Get the Beta Refund transaction.
   *
   * @returns null if cnd hasn't seen a refund transaction, otherwise, {@link Transaction} if supported or the transaction id as string.
   */
  public async getBetaRefundTransaction(): Promise<
    Transaction | string | null
  > {
    const details = await this.fetchDetails();
    const transactionId = details.properties!.state!.beta_ledger!.refund_tx;
    return this.getTransaction(details, transactionId);
  }

  public async executeAction(action: SirenAction): Promise<AxiosResponse> {
    return this.cnd.executeSirenAction(action!, async (field: Field) => {
      try {
        // Awaiting here allows us to have better context
        return await this.fieldValueResolver(field);
      } catch (error) {
        throw new WalletError(action.name, error, field);
      }
    });
  }

  private getTransaction(
    details: SwapDetails,
    transactionId: string | null
  ): Transaction | string | null {
    if (!transactionId) {
      return null;
    }
    const alphaLedger = details.properties!.parameters.alpha_ledger;
    if (ledgerIsEthereum(alphaLedger)) {
      return new Transaction(
        { ethereum: this.wallets.ethereum },
        transactionId
      );
    }
    return transactionId;
  }

  private async executeAvailableAction(
    actionName: string,
    tryIntervalSecs: number
  ): Promise<AxiosResponse> {
    while (true) {
      await sleep(tryIntervalSecs * 1000);

      // This throws if cnd returns an error or there is a network error
      const swap = await this.fetchDetails();
      const actions = swap.actions;

      if (!actions || actions.length === 0) {
        continue;
      }

      const action = actions.find(action => action.name === actionName);

      if (!action) {
        continue;
      }

      // This throws if cnd returns an error or there is a network error
      return this.executeAction(action);
    }
  }

  private async fieldValueResolver(field: Field): Promise<string | undefined> {
    const classes: string[] = field.class;

    if (classes.includes("bitcoin") && classes.includes("address")) {
      return this.wallets.bitcoin.getAddress();
    }

    if (classes.includes("bitcoin") && classes.includes("feePerWU")) {
      return this.wallets.bitcoin.getFee();
    }

    if (classes.includes("ethereum") && classes.includes("address")) {
      return this.wallets.ethereum.getAccount();
    }
  }
}

/**
 * Defines the parameters (for how long and how often) to try executing an action of a {@link Swap}.
 */
export interface TryParams {
  maxTimeoutSecs: number;
  tryIntervalSecs: number;
}
