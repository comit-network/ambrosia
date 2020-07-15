import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AboutPage from '../../app/pages/AboutPage';

test('loads and displays about page', async () => {
  const { findByText } = render(<AboutPage />);

  const content = await findByText('About');
  expect(content).toBeInTheDocument();
});
