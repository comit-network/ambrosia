import {Currency} from "./currency";

export enum Role {
    ALICE = 'Alice',
    BOB = 'Bob'
}

export enum SwapEventName {
    HERC20_DEPLOYED = 'herc20_deployed',
    HERC20_FUNDED = 'herc20_funded',
    HERC20_REDEEMED = 'herc20_redeemed',
    HERC20_REFUNDED = 'herc20_refunded',
    HBIT_FUNDED = 'hbit_funded',
    HBIT_REDEEMED = 'hbit_redeemed',
    HBIT_REFUNDED = 'hbit_refunded'
}

export enum Protocol {
    HBIT = 'hbit',
    HER20 = 'herc20'
}

export type SwapEvent = {
    name: SwapEventName,
    seen_at: string,
    tx: string
}

export type Asset = {
    currency: Currency,
    value: string,
    decimals: number,
}

export type ProtocolParams = {
    protocol: Protocol,
    asset: Asset
}

export type Swap = {
    role: Role,
    alpha: ProtocolParams,
    beta: ProtocolParams
    events: SwapEvent[]
}
