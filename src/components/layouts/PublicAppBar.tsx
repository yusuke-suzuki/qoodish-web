'use client';

import { Search } from '@mui/icons-material';
import { AppBar, Box, Button, IconButton, Toolbar } from '@mui/material';
import Link from 'next/link';
import { memo, useContext } from 'react';
import AuthContext from '../../context/AuthContext.ts';
import ShellContext from '../../context/ShellContext.tsx';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import LocaleMenuButton from './LocaleMenuButton.tsx';
import Logo from './Logo.tsx';

export default memo(function PublicAppBar() {
  const { openSearch } = useContext(ShellContext);
  const { setSignInRequired } = useContext(AuthContext);
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    // Light rather than the app's amber: white on amber falls short of the
    // contrast a reader needs, and the bar carries the only call to action a
    // visitor without an account has.
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ gap: 1 }}>
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

        <LocaleMenuButton variant="bar" />

        {/* The pitch belongs on the landing, which says "get started" over the
            same sheet. In the bar this is the way back in, and someone
            returning to sign in should not have to read an invitation to
            start. */}
        <Button
          variant="contained"
          color="primary"
          disableElevation
          onClick={() => setSignInRequired(true)}
          sx={{ borderRadius: 999, px: 3, flexShrink: 0 }}
        >
          {dictionary.login}
        </Button>
      </Toolbar>
    </AppBar>
  );
});
