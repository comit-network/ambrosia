import { AxiosResponse } from 'axios';
import { Entity } from '../comit-sdk/cnd/siren';
import {Stack} from "@chakra-ui/core";

// TODO: Change this to whatever we agree on for API change
// Consider: https://www.kraken.com/features/api#public-market-data
// We might not need the siren based model here
export function mockComitMarketData() {
  // @ts-ignore
  return {
    data: {
      entities: [
        {
          class: ['bid-ask'],
          properties: {
            // Do we want to consider volume as well?
            currencyPair: "BTC/DAI",
            bid: "9000",
            ask: "9100"
          },
          entities: [],
          links: [],
          actions: [],
          rel: ['current']
        },
        {
          // accumulated bid-ask over time in intervals
          class: ['bid-ask'],
          properties: {
            interval: "5",
            interval_unit: "min",
            start_time: "2020-08-18-16:30:20",
            end_time: "2020-08-18-18:30:00",
            values: [
              {
                timestamp: "2020-08-18-16:30:20",
                bid: "9000",
                ask: "9100"
              },
              {
                timestamp: "2020-08-18-16:35:20",
                bid: "9000",
                ask: "9050"
              },
              {
                timestamp: "2020-08-18-16:40:20",
                bid: "9050",
                ask: "9100"
              },
              // ...
            ]
          },
          entities: [],
          links: [],
          actions: [],
          rel: ['historical']
        }
      ]
    }
  };
}

// TODO: Change this to whatever we agree on for API change
export function mockSwaps(): AxiosResponse<Entity> {
  // @ts-ignore
  return {
    data: {
      properties: [
        {
          href: '/swaps/6a5fbbb1-d50e-4ceb-bed4-086bd5523cab/'
        },
        {
          href: '/swaps/6a5fbbb1-d50e-4ceb-bed4-086bd5523cac/'
        }
      ]
    }
  };
}

// TODO: Change this to whatever we agree on for API change
export function mockSwap(
  href: string,
  mockAction: string
): AxiosResponse<Entity> {
  // @ts-ignore
  return {
    data: {
      class: ['swap'],
      properties: {
        role: 'Alice'
      },
      entities: [
        {
          class: ['parameters'],
          properties: {
            protocol: 'herc20',
            quantity: '1225986342026250000000',
            token_contract: '0xddbee336d0ac3fd4668a6f767878f9a08933765e'
          },
          entities: [],
          links: [],
          actions: [],
          rel: ['alpha']
        },
        {
          class: ['parameters'],
          properties: {
            protocol: 'hbit',
            quantity: '9990725'
          },
          entities: [],
          links: [],
          actions: [],
          rel: ['beta']
        },
        {
          class: ['state'],
          properties: {
            events: {
              deploy:
                '0x45b5f566f74e0a08f043f42a59ca36d02b7b321cc8560b8f1464d081d3d0d89b'
            },
            status: 'DEPLOYED'
          },
          entities: [],
          links: [],
          actions: [],
          rel: ['alpha']
        },
        {
          class: ['state'],
          properties: {
            events: {},
            status: 'NONE'
          },
          entities: [],
          links: [],
          actions: [],
          rel: ['beta']
        }
      ],
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

// TODO: Change this to whatever we agree on for API change -> Include Amounts
export function mockOrder() {
  // @ts-ignore
  return {
    data: {
      class: ['order'],
      properties: {
        trading_pair: "BTC/DAI",
        position: "sell",
        price: "9000",
        quantity: "50000000", // in sats, 0.5 btc

        // make sub-entity? But is not entity itself...?
        role: "Alice", // is not needed, set by cnd automatically?
        refund_identity: "bitcoin-address", // will not be displayed, automatically created
        redeem_identity: "ethereum-address",  // will not be displayed, automatically created
      },
      entities: [
      ],
      actions: [
      ]
    }
  };
}
