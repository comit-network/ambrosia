import React from 'react';
import { theme } from '@chakra-ui/core';

const customIcons = {
  // #142533
  ledger: {
    path: (
      <g fill="currentColor" fillRule="nonzero">
        <path d="m16.7 0h-9.11v12.29h12.3v-9.11c0-1.745-1.436-3.18-3.18-3.18h-0.01z" />
        <path d="m4.75 0h-1.57c-1.744 0-3.18 1.436-3.18 3.18v1.57h4.75z" />
        <path d="m0 7.59h4.75v4.75h-4.75z" />
        <path d="m15.18 19.89h1.57c1.745 0 3.18-1.436 3.18-3.18v-0.01-1.52h-4.75z" />
        <path d="m7.59 15.18h4.75v4.75h-4.75z" />
        <path d="m0 15.18v1.57c0 1.744 1.436 3.18 3.18 3.18h1.57v-4.75z" />
      </g>
    )
  }
};

// Let's say you want to add custom colors
const customTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    brand: {
      900: '#1a365d',
      800: '#153e75',
      700: '#2a69ac'
    }
  },
  icons: {
    ...theme.icons,
    ...customIcons
  }
};

export default customTheme;
