import { Search } from '@mui/icons-material';
import { AppBar, Box, IconButton, Toolbar } from '@mui/material';
import { memo, useContext, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import ProfileAvatar from '../common/ProfileAvatar';
import BackButton from './BackButton';
import Logo from './Logo';
import MobileDrawer from './MobileDrawer';

type Props = {
  showBackButton?: boolean;
  onSearchOpen: () => void;
  onCreateMapClick: () => void;
};

export default memo(function MobileAppBar({
  showBackButton,
  onSearchOpen,
  onCreateMapClick
}: Props) {
  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);

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
            {showBackButton ? (
              <BackButton />
            ) : (
              <IconButton
                size="small"
                edge="start"
                onClick={() => setDrawerOpen(true)}
              >
                <ProfileAvatar profile={profile} size={32} />
              </IconButton>
            )}
          </Box>

          <Logo color="inherit" />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={onSearchOpen} edge="end" color="inherit">
              <Search />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <MobileDrawer
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        onCreateMapClick={onCreateMapClick}
      />
    </>
  );
});
