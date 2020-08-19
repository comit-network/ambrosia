import { AxiosResponse } from 'axios';
import { Entity } from '../comit-sdk/cnd/siren';

// TODO: Figure this out
export function mockSwapHistory(): AxiosResponse<Entity> {
  // @ts-ignore
  return {
    data: {
      class: ["trades"],
      properties: {
      },
      entities: [
        {
          class: ["trade"],
          properties: {
            open_date: "", // order creation timestamp
            close_date: "", // swap finished timestamp
            quantity: {
              // like in order
            },
            price: {
              // like in order
            },
            percent_of_order_filled: "75%",
            position: "buy",
            order_type: "limit",
            maker: "some-peer-id",
            transactions: {
              send: {
                ledger: 'bitcoin',
                tx: '...'
              },
              receive: {
                ledger: 'ethereum',
                tx: '...'
              }
            }
          },
          rel: ["item"],
          links: [
            {
              "rel": [
                "swap"
              ],
              "class": [],
              "href": "/swaps/6a5fbbb1-d50e-4ceb-bed4-086bd5523cab"
            },
            {
              "rel": [
                "order"
              ],
              "class": [],
              "href": "/order/some-id"
            }
          ]
        }
      ],
      actions: [],
      links: [],
    }
  }
}

// GET /swaps
export function mockOngoingSwaps(): AxiosResponse<Entity> {
  // @ts-ignore
  return {
    data: {
      properties: {},
      entities: [
        {
          href: '/swaps/6a5fbbb1-d50e-4ceb-bed4-086bd5523cab/',
          rel: ["item"]
        },
        {
          href: '/swaps/6a5fbbb1-d50e-4ceb-bed4-086bd5523cac/',
          rel: ["item"]
        }
      ]
    }
  };
}

// GET /swaps/:id
export function mockSwap(
  href: string,
  mockAction: string
): AxiosResponse<Entity> {
  // @ts-ignore
  return {
    data: {
      class: ['swap'],
      properties: {
        role: 'Alice',
        alpha: {
          protocol: 'herc20',
          asset: {
            currency: "DAI",
            value: "9000000000000000000000",
            decimals: 18,
          },
        },
        beta: {
          protocol: 'hbit',
          asset: {
            currency: "BTC",
            value: "100000000",
            decimals: 8,
          },
        },
        events: [
          {
            name: 'herc20_deployed',
            seen_at: '',
            tx: ''
          },
          {
            name: 'herc20_funded',
            seen_at: '',
            tx: ''
          },
          {
            name: 'hbit_funded',
            seen_at: '',
            tx: ''
          }
        ]
      },
      actions: [
        {
          name: mockAction,
          class: [],
          method: 'GET',
          href: href + mockAction,
          fields: []
        }
      ]
    }
  };
}

// GET /orders
export function mockOrder() {
  // @ts-ignore
  return {
    data: {
      class: ['orders'],
      properties: {},
      entities: [
        {
          class: ["order"],
          properties: {
            id: "some-order-uuid",
            position: "sell",
            price: {
              currency: "DAI",
              value: "90000000000000000000000",
              decimals: 18,
            },
            quantity: {
              currency: "BTC",
              value: "10000000",
              decimals: 8,
            },
            ours: true,
            maker: "some_peer_id",
            state: {
              open: "0.3", //percentage, 0.3=30%, rounded to precision 2
              closed: "0.1",
              settling: "0.0",
              failed: "0.6"
            }
          },
          actions: [
            {
              name: "cancel",
              class: [],
              method: 'DELETE',
              href: "cnd/orders/orderId",
              fields: []
            }
          ]
        }

      ],
      actions: [
      ]
    }
  };
}

// POST /orders
interface PostOrderBody {
  position: "buy" | "sell",
  quantity: string, // in sats
  price: string, // in wei (atto)
}
