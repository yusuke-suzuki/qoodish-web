'use client';

import { Menu, Search } from '@mui/icons-material';
import { AppBar, Box, Button, IconButton, Toolbar } from '@mui/material';
import Link from 'next/link';
import { memo, useContext, useState } from 'react';
import AuthContext from '../../context/AuthContext.ts';
import ShellContext from '../../context/ShellContext.tsx';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import LocaleMenuButton from './LocaleMenuButton.tsx';
import Logo from './Logo.tsx';
import MobileDrawer from './MobileDrawer.tsx';

export default memo(function PublicAppBar() {
  const { openSearch, openCreateMap } = useContext(ShellContext);
  const { setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Only below the width where the bar can spell out its destinations
            itself; above it, the drawer would repeat what is already there. */}
        <IconButton
          edge="start"
          onClick={() => setDrawerOpen(true)}
          title={dictionary.menu}
          aria-label={dictionary.menu}
          sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
        >
          <Menu />
        </IconButton>

        <Box
          component={Link}
          href={localePath('/')}
          sx={{ display: 'flex', mr: 'auto', textDecoration: 'none' }}
        >
          <Logo />
        </Box>

        <Button
          component={Link}
          href={localePath('/discover')}
          color="inherit"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          {dictionary.discover}
        </Button>

        <IconButton
          onClick={openSearch}
          title={dictionary.search}
          aria-label={dictionary.search}
        >
          <Search />
        </IconButton>

        {/* The drawer lists the languages too, and on a phone the bar has no
            room for both it and the way in. */}
        <Box sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
          <LocaleMenuButton variant="bar" />
        </Box>

        {/* The same sheet the landing opens, but named for the reader who
            already has an account rather than for the one who has not. */}
        <Button
          variant="contained"
          color="primary"
          disableElevation
          onClick={() => setSignInRequired(true)}
          sx={{ borderRadius: 999, px: { xs: 2, sm: 3 }, flexShrink: 0 }}
        >
          {dictionary.login}
        </Button>
      </Toolbar>

      <MobileDrawer
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        onCreateMapClick={openCreateMap}
      />
    </AppBar>
  );
});
