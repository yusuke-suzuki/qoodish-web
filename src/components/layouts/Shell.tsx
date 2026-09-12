'use client';

import { Box } from '@mui/material';
import { type ReactNode, useContext } from 'react';
import AuthContext from '../../context/AuthContext.ts';
import BottomNav from './BottomNav.tsx';
import MiniDrawer from './MiniDrawer.tsx';
import MobileAppBar from './MobileAppBar.tsx';
import PublicAppBar from './PublicAppBar.tsx';

type Props = {
  children: ReactNode;
  // The server could not read a token but the browser says it had a session.
  // The app chrome is the honest render for that reader: someone who already
  // has an account is not asked to make one, and the refresh that follows
  // settles it either way.
  serverPending: boolean;
};

// Published so a page that sizes itself against the viewport can subtract the
// chrome instead of assuming which one is up. The map is the reason: it fills
// the screen, and the bar and the rail take their space from different sides.
const CHROME_TOP = {
  '--chrome-top': '56px',
  '--chrome-left': '0px'
};

// One chrome per audience rather than one per route. A reader with an account
// gets the rail, which stays out of the way of a full page map; a visitor
// without one gets a bar that carries the way in, which the rail only held in
// a menu behind an avatar.
export default function Shell({ children, serverPending }: Props) {
  const { authenticated } = useContext(AuthContext);

  if (!authenticated && !serverPending) {
    return (
      <>
        <PublicAppBar />

        <Box
          component="main"
          sx={(theme) => ({
            ...CHROME_TOP,
            [theme.breakpoints.up('sm')]: { '--chrome-top': '64px' },
            pt: 'var(--chrome-top)'
          })}
        >
          {children}
        </Box>
      </>
    );
  }

  return (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <MobileAppBar />
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <MiniDrawer />
      </Box>

      <Box
        component="main"
        sx={(theme) => ({
          ...CHROME_TOP,
          [theme.breakpoints.up('sm')]: { '--chrome-top': '64px' },
          // The rail replaces the bar from md up, so the page gains its width
          // back at the top and loses it at the side.
          [theme.breakpoints.up('md')]: {
            '--chrome-top': '0px',
            '--chrome-left': '64px'
          },
          pt: 'var(--chrome-top)',
          pl: 'var(--chrome-left)'
        })}
      >
        {children}

        <BottomNav />
      </Box>
    </>
  );
}
