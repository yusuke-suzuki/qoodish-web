'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import BottomNav from './BottomNav.tsx';
import TopBar from './TopBar.tsx';

type Props = {
  children: ReactNode;
};

// Published so a page that sizes itself against the viewport can subtract the
// chrome rather than assume it. The map is the reason: it fills the screen.
const CHROME = {
  '--chrome-top': '56px',
  '--chrome-left': '0px'
};

export default function Shell({ children }: Props) {
  return (
    <>
      <TopBar />

      <Box
        component="main"
        sx={(theme) => ({
          ...CHROME,
          [theme.breakpoints.up('sm')]: { '--chrome-top': '64px' },
          pt: 'var(--chrome-top)'
        })}
      >
        {children}

        <BottomNav />
      </Box>
    </>
  );
}
