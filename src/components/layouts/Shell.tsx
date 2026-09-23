'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import BottomNav from './BottomNav.tsx';
import SideNav, { RAIL_WIDTH } from './SideNav.tsx';
import TopBar from './TopBar.tsx';

type Props = {
  children: ReactNode;
};

export default function Shell({ children }: Props) {
  return (
    <>
      <TopBar />

      {/* Published so a page that sizes itself against the viewport can
          subtract the chrome rather than assume it. The map is the reason:
          it fills the screen. */}
      <Box
        sx={(theme) => ({
          '--chrome-top': '56px',
          '--chrome-left': '0px',
          [theme.breakpoints.up('sm')]: { '--chrome-top': '64px' },
          [theme.breakpoints.up('md')]: {
            '--chrome-left': RAIL_WIDTH
          },
          display: 'flex'
        })}
      >
        <SideNav />

        <Box
          component="main"
          sx={{ flex: 1, minWidth: 0, pt: 'var(--chrome-top)' }}
        >
          {children}

          <BottomNav />
        </Box>
      </Box>
    </>
  );
}
