import { Box, Container, Grid, useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import { type ReactNode, memo, useCallback, useContext, useState } from 'react';
import type { AppMap } from '../../types';
import AuthContext from '../context/AuthContext';
import useDictionary from '../hooks/useDictionary';
import SignInRequiredDialog from './auth/SignInRequiredDialog';
import BottomNav from './layouts/BottomNav';
import MiniDrawer from './layouts/MiniDrawer';
import MobileAppBar from './layouts/MobileAppBar';
import SearchDialog from './layouts/SearchDialog';
import CreateMapDialog from './maps/CreateMapDialog';

type Props = {
  children: ReactNode;
  sidebar?: ReactNode;
  fullWidth?: boolean;
  hideBottomNav?: boolean;
  showBackButton?: boolean;
};

function Layout({
  children,
  sidebar,
  fullWidth,
  hideBottomNav,
  showBackButton
}: Props) {
  const theme = useTheme();

  const dictionary = useDictionary();

  const { push } = useRouter();

  const { currentUser, setSignInRequired } = useContext(AuthContext);

  const [searchOpen, setSearchOpen] = useState(false);
  const [createMapDialogOpen, setCreateMapDialogOpen] = useState(false);

  const handleCreateMapClick = useCallback(() => {
    if (!currentUser) {
      setSignInRequired(true);

      return;
    }

    setCreateMapDialogOpen(true);
  }, [currentUser, setSignInRequired]);

  const handleCreatedMap = useCallback(
    (map: AppMap) => {
      setCreateMapDialogOpen(false);
      push(`/maps/${map.id}`);
    },
    [push]
  );

  return (
    <>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SignInRequiredDialog />
      <CreateMapDialog
        open={createMapDialogOpen}
        onClose={() => setCreateMapDialogOpen(false)}
        onSaved={handleCreatedMap}
      />

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <MobileAppBar
          showBackButton={showBackButton}
          onSearchOpen={() => setSearchOpen(true)}
          onCreateMapClick={handleCreateMapClick}
        />

        {currentUser && !hideBottomNav && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1
            }}
          >
            <BottomNav onCreateMapClick={handleCreateMapClick} />
          </Box>
        )}
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <MiniDrawer
          onSearchOpen={() => setSearchOpen(true)}
          onCreateMapClick={handleCreateMapClick}
        />
      </Box>

      <Box
        sx={{
          pl: {
            md: 8
          },
          pt: {
            xs: 7,
            sm: 8,
            md: 0
          },
          pb: {
            xs: hideBottomNav ? 0 : 7,
            md: 0
          }
        }}
      >
        <Box
          component={fullWidth ? Box : Container}
          sx={{
            py: fullWidth ? 0 : { xs: 2, md: 4 }
          }}
        >
          <Grid container spacing={fullWidth ? 0 : 4}>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: fullWidth ? 12 : 8,
                lg: fullWidth ? 12 : 8,
                xl: fullWidth ? 12 : 8
              }}
            >
              {children}
            </Grid>

            {!fullWidth && sidebar && (
              <Grid
                size={{ md: 4, lg: 4, xl: 4 }}
                sx={{ display: { xs: 'none', md: 'block' } }}
              >
                {sidebar}
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </>
  );
}

export default memo(Layout);
