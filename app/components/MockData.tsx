import { AxiosResponse } from 'axios';
import { Entity } from '../comit-sdk/cnd/siren';

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
export function buyMockSwap(
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
export function mockOrder() {}
