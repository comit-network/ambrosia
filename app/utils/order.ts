import {Action, Entity} from "../comit-sdk/cnd/siren";
import {AxiosResponse} from "axios";
import {CurrencyValue} from "./currency";

export interface OrderState {
    open: string;
    closed: string;
    settling: string;
    failed: string;
}

export interface Order {
    id: string;
    position: string;
    price: CurrencyValue;
    quantity: CurrencyValue;
    state: OrderState;
    actions: Action[];
}

export function intoOrders(response: AxiosResponse<Entity>): Order[] {
    return response.data.entities
        .map(order => {
            const { properties } = order;
            const { actions } = order;
            const typedOrder = properties as Order;
            typedOrder.actions = actions as Action[];
            return typedOrder;
        })
        .sort((order1, order2) => {
            const price1 = order1.price.value;
            const price2 = order2.price.value;
            if (price1 < price2) {
                return -1;
            }
            if (price1 > price2) {
                return 1;
            }
            return 0;
        });
}
