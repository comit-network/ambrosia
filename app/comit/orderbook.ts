import { Cnd } from 'comit-sdk';

export default class Orderbook {
  cnd: Cnd;

  constructor(cnd: Cnd) {
    this.cnd = cnd;
  }

  /**
   * Returns a list of orders.
   */
  // eslint-disable-next-line class-methods-use-this
  async getOrders() {
    const orders = {
      entities: [
        {
          id: '',
          makerId: '123',
          side: 'buy',
          makerAssetQuantity: 1,
          takerAssetQuantity: 2,
          signature: '',
          expires: 123,
          expiryLength: 7200
        }
      ]
    };
    return orders;
  }

  // async placeOrder(_order_) {
  //   return 'TODO';
  // }

  // async takeOrder(_orderId_) {
  //   return 'TODO';
  // }

  // async getMakers() {
  //   return 'TODO';
  // }

  // async subscribe(_makerId_, _pair_) {
  //   return 'TODO';
  // }
}
