import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MarketData from '../../app/components/MarketData';

const server = setupServer(
  rest.get('https://api.coincap.io/v2/rates/ethereum', (req, res, ctx) => {
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

test('loads and displays market data', async () => {
  render(<MarketData />);

  // fireEvent.click(screen.getByText('Load Greeting'))
  // await waitFor(() => screen.getByRole('heading'))

  const items = await screen.findByText('$239.67');
  expect(items).not.toBeEmpty();
});

// test('handlers server error', async () => {
//   server.use(
//     rest.get('/greeting', (req, res, ctx) => {
//       return res(ctx.status(500))
//     })
//   )

//   render(<Fetch url="/greeting" />)

//   fireEvent.click(screen.getByText('Load Greeting'))

//   await waitFor(() => screen.getByRole('alert'))

//   expect(screen.getByRole('alert')).toHaveTextContent('Oops, failed to fetch!')
//   expect(screen.getByRole('button')).not.toHaveAttribute('disabled')
// })
