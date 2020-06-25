export default class Orderbook {
  cndURL: string;

  constructor(cndURL: string) {
    this.cndURL = cndURL;
  }

  /**
   * Returns a list of orders.
   */
  // eslint-disable-next-line class-methods-use-this
  async getOrders() {
    // TODO: read env
    // TODO: use axios to call cnd url
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

  // async takeOrder(_orderId_) {
  //   return 'TODO';
  // }
}
