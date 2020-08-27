import {AxiosResponse} from "axios";
import {Entity} from "../comit-sdk/cnd/siren";
import {CurrencyValue} from "./currency";

export interface MarketOrder {
    id: string;
    position: string;
    price: CurrencyValue;
    quantity: CurrencyValue;
    ours: boolean;
    maker: string;
}

interface Market {
    buyOrders: MarketOrder[];
    sellOrders: MarketOrder[];
    highestBuyOrder: MarketOrder;
    lowestSellOrder: MarketOrder;
}

export function intoMarket(response: AxiosResponse<Entity>): Market {
    const marketOrders = response.data.entities.map(
        order => order.properties as MarketOrder
    );

    // sorted ascending by price
    const buyOrders = marketOrders
        .filter(order => order.position === 'buy')
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
    // sorted descending by price
    const sellOrders = marketOrders
        .filter(order => order.position === 'sell')
        .sort((order1, order2) => {
            const price1 = order1.price.value;
            const price2 = order2.price.value;
            if (price1 < price2) {
                return 1;
            }
            if (price1 > price2) {
                return -1;
            }
            return 0;
        });

    const theirOrders = marketOrders.filter(order => !order.ours);
    const theirBuyOrders = theirOrders.filter(order => order.position === 'buy');
    const theirSellOrders = theirOrders.filter(
        order => order.position === 'sell'
    );
    // their highest buying price is my best selling price
    const highestBuyOrder = theirBuyOrders.reduce((a, b) =>
        a.quantity.value > b.quantity.value ? a : b
    );
    // their lowest selling price is my best buying price
    const lowestSellOrder = theirSellOrders.reduce((a, b) =>
        a.quantity.value < b.quantity.value ? a : b
    );

    return {
        sellOrders,
        buyOrders,
        highestBuyOrder,
        lowestSellOrder
    };
}
