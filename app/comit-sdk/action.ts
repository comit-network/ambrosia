import {Transaction} from "./transaction";
import {LedgerAction} from "./cnd/action_payload";
import {Cnd} from "./cnd/cnd";
import {AllWallets} from "./wallet";
import {ethers} from "ethers";
import {Action} from "./cnd/siren";

export class WalletError extends Error {
    constructor(
        public readonly attemptedAction: string,
        public readonly source: Error,
        public readonly callParams: any
    ) {
        super(source.message);
    }
}

export default async function executeLedgerAction(
    action: Action,
    cnd: Cnd,
    wallets: AllWallets
): Promise<Transaction | string> {

    let response = await cnd.executeSirenAction(action!);
    let ledgerAction = response.data as LedgerAction;
    
    switch (ledgerAction.type) {
        case "bitcoin-broadcast-signed-transaction": {
            const {hex, network} = ledgerAction.payload;

            try {
                const transactionId = await wallets.bitcoin.broadcastTransaction(
                    hex,
                    network
                );
                return new Transaction(
                    {bitcoin: wallets.bitcoin},
                    transactionId
                );
            } catch (error) {
                throw new WalletError(ledgerAction.type, error, {hex, network});
            }
        }
        case "bitcoin-send-amount-to-address": {
            const {to, amount, network} = ledgerAction.payload;
            const sats = parseInt(amount, 10);

            try {
                const transactionId = await wallets.bitcoin.sendToAddress(
                    to,
                    sats,
                    network
                );
                return new Transaction(
                    {bitcoin: wallets.bitcoin},
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
                const transactionId = await wallets.ethereum.callContract(
                    data,
                    contract_address,
                    gas_limit,
                    chain_id
                );
                return new Transaction(
                    {ethereum: wallets.ethereum},
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
            const {amount, data, gas_limit, chain_id} = ledgerAction.payload;
            console.log(amount);

            try {
                const transactionId = await wallets.ethereum.deployContract(
                    data,
                    ethers.BigNumber.from(amount),
                    gas_limit,
                    chain_id
                );
                return new Transaction(
                    {ethereum: wallets.ethereum},
                    transactionId
                );
            } catch (error) {
                throw new WalletError(ledgerAction.type, error, {
                    data,
                    amount,
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
                await wallets.lightning.assertLndDetails(
                    self_public_key,
                    chain,
                    network
                );

                await wallets.lightning.sendPayment(
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
                await wallets.lightning.assertLndDetails(
                    self_public_key,
                    chain,
                    network
                );

                return wallets.lightning.addHoldInvoice(
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
                await wallets.lightning.assertLndDetails(
                    self_public_key,
                    chain,
                    network
                );

                await wallets.lightning.settleInvoice(secret);

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


