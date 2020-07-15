import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ThemeProvider } from '@chakra-ui/core';
import MarketData from '../../app/components/MarketData';

const server = setupServer(
  rest.get('/test', (req, res, ctx) => {
    // TOFIX: this is not being called
    console.log('!!!CALLED!!!');
    return res(
      ctx.json({
        data: {
          id: 'ethereum',
          symbol: 'ETH',
          currencySymbol: null,
          type: 'crypto',
          rateUsd: '239.6774901998598881'
        },
        timestamp: 1594803380127
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// TODO: define providers in custom helper https://testing-library.com/docs/react-testing-library/setup
test('loads and displays market data', async () => {
  const { getByText, container } = render(
    <ThemeProvider>
      <MarketData />
    </ThemeProvider>
  );

  const heading = getByText('ETH Price');
  expect(heading).toBeInTheDocument();

  // Value before data is loaded
  expect(getByText('$Loading')).toBeInTheDocument();

  // Value after data is loaded
  // TODO: not working because of async loading?
  // https://github.com/vercel/swr/blob/master/test/use-swr.test.tsx#L41-L53
  await waitFor(
    () => {
      expect(getByText('$239.67')).toBeInTheDocument();
    },
    { container }
  );
});
