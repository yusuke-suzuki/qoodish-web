'use client';

import { AddBox, Menu as MenuIcon, Search } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Slide,
  Toolbar,
  useMediaQuery,
  useScrollTrigger
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useContext, useState } from 'react';
import AuthContext from '../../context/AuthContext.ts';
import ShellContext from '../../context/ShellContext.tsx';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import AccountMenuButton from './AccountMenuButton.tsx';
import LocaleMenuButton from './LocaleMenuButton.tsx';
import Logo from './Logo.tsx';
import NavDrawer from './NavDrawer.tsx';
import NotificationsBadge from './NotificationsBadge.tsx';
import TopBarSearch from './TopBarSearch.tsx';

function TopBarContent() {
  const { openSearch, openCreateMap, appBarHidden } = useContext(ShellContext);
  const { authenticated, setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const scrollTrigger = useScrollTrigger();

  // Height is what a small screen is short of, so only there does the bar give
  // its own up on the way down.
  const compact = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <>
      <Slide
        appear={false}
        direction="down"
        in={!appBarHidden && !(compact && scrollTrigger)}
      >
        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              title={dictionary.menu}
              aria-label={dictionary.menu}
            >
              <MenuIcon />
            </IconButton>

            <Box
              component={Link}
              href={localePath('/')}
              sx={{ display: 'flex', flexShrink: 0, textDecoration: 'none' }}
            >
              <Logo />
            </Box>

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                justifyContent: 'center',
                px: { md: 2 }
              }}
            >
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  width: '100%',
                  maxWidth: { md: 400, xl: 560 }
                }}
              >
                <TopBarSearch />
              </Box>
            </Box>

            {/* Below md nothing else lists the destinations while the drawer
                is shut, so the bar names the one a visitor is most likely to
                want; from md the rail carries it. */}
            <Button
              component={Link}
              href={localePath('/discover')}
              color="inherit"
              sx={{
                display: { xs: 'none', sm: 'inline-flex', md: 'none' },
                flexShrink: 0
              }}
            >
              {dictionary.discover}
            </Button>

            {authenticated && (
              <Button
                onClick={openCreateMap}
                variant="contained"
                color="secondary"
                disableElevation
                startIcon={<AddBox />}
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                {dictionary['create new map']}
              </Button>
            )}

            <IconButton
              onClick={openSearch}
              title={dictionary.search}
              aria-label={dictionary.search}
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <Search />
            </IconButton>

            {authenticated && (
              <IconButton
                component={Link}
                href={localePath('/notifications')}
                title={dictionary.notifications}
                aria-label={dictionary.notifications}
              >
                <NotificationsBadge />
              </IconButton>
            )}

            <Box sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              <LocaleMenuButton variant="bar" />
            </Box>

            {authenticated ? (
              <Box sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
                <AccountMenuButton />
              </Box>
            ) : (
              // The same sheet the landing opens, but named for the reader who
              // already has an account rather than for the one who has not.
              <Button
                variant="contained"
                color="primary"
                disableElevation
                onClick={() => setSignInRequired(true)}
                sx={{ borderRadius: 999, px: { xs: 2, sm: 3 }, flexShrink: 0 }}
              >
                {dictionary.login}
              </Button>
            )}
          </Toolbar>
        </AppBar>
      </Slide>

      <NavDrawer
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        onCreateMapClick={openCreateMap}
      />
    </>
  );
}

export default memo(function TopBar() {
  const pathname = usePathname();

  // The bar lives in the persistent root layout, so useScrollTrigger keeps its
  // trigger value across client navigations and never recomputes without a
  // scroll event. Remount on path change so the scroll state reflects the new
  // page (scrolled to top) instead of staying hidden.
  return <TopBarContent key={pathname} />;
});
