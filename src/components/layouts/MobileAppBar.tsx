'use client';

import { Search } from '@mui/icons-material';
import { AppBar, Box, IconButton, Toolbar } from '@mui/material';
import { memo, useContext, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import ProfileContext from '../../context/ProfileContext';
import ShellContext from '../../context/ShellContext';
import ProfileAvatar from '../common/ProfileAvatar';
import Logo from './Logo';
import MobileDrawer from './MobileDrawer';

export default memo(function MobileAppBar() {
  const { uid } = useContext(AuthContext);
  const { openSearch, openCreateMap } = useContext(ShellContext);
  const profile = useContext(ProfileContext);

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AppBar position="fixed">
        <Toolbar
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <IconButton
              size="small"
              edge="start"
              onClick={() => setDrawerOpen(true)}
            >
              <ProfileAvatar profile={profile} size={32} />
            </IconButton>
          </Box>

          <Logo color="inherit" />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={openSearch} edge="end" color="inherit">
              <Search />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <MobileDrawer
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        onCreateMapClick={openCreateMap}
      />
    </>
  );
});
