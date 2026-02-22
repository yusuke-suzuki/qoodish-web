import {
  Box,
  CardContent,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  type ReactNode,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import type { AppMap } from '../../types';
import AuthContext from '../context/AuthContext';
import useDictionary from '../hooks/useDictionary';
import SignInRequiredDialog from './auth/SignInRequiredDialog';
import BottomNav from './layouts/BottomNav';
import FbPage from './layouts/FbPage';
import MiniDrawer from './layouts/MiniDrawer';
import MobileAppBar from './layouts/MobileAppBar';
import RecommendMaps from './layouts/RecommendMaps';
import SearchDialog from './layouts/SearchDialog';
import TrendingMaps from './layouts/TrendingMaps';
import CreateMapDialog from './maps/CreateMapDialog';

type Props = {
  children: ReactNode;
  fullWidth?: boolean;
  hideBottomNav?: boolean;
  showBackButton?: boolean;
};

function Layout({ children, fullWidth, hideBottomNav, showBackButton }: Props) {
  const theme = useTheme();

  const dictionary = useDictionary();

  const { push, events } = useRouter();

  const { currentUser, setSignInRequired } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
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

  const showProgress = useCallback((_url, { shallow }) => {
    if (shallow) return;

    setLoading(true);
  }, []);

  const hideProgress = useCallback(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    events.on('routeChangeStart', showProgress);
    events.on('routeChangeComplete', hideProgress);
    events.on('routeChangeError', hideProgress);

    return () => {
      events.off('routeChangeStart', showProgress);
      events.off('routeChangeComplete', hideProgress);
      events.off('routeChangeError', hideProgress);
    };
  }, [showProgress, hideProgress, events]);

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
          position: 'fixed',
          top: { xs: theme.spacing(7), sm: theme.spacing(8), md: 0 },
          zIndex: { xs: 1101, md: 1201 },
          width: '100%',
          display: loading ? 'block' : 'none'
        }}
      >
        <LinearProgress color="secondary" />
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

            {!fullWidth && (
              <Grid
                size={{ md: 4, lg: 4, xl: 4 }}
                sx={{ display: { xs: 'none', md: 'block' } }}
              >
                <Stack spacing={2}>
                  <RecommendMaps />

                  <Divider />

                  <TrendingMaps />

                  <Paper elevation={0}>
                    <CardContent>
                      <Stack spacing={1}>
                        <MuiLink
                          href="/terms"
                          underline="hover"
                          color="inherit"
                          component={Link}
                          title={dictionary['terms of service']}
                        >
                          {dictionary['terms of service']}
                        </MuiLink>
                        <MuiLink
                          href="/privacy"
                          underline="hover"
                          color="inherit"
                          component={Link}
                          title={dictionary['privacy policy']}
                        >
                          {dictionary['privacy policy']}
                        </MuiLink>
                        <Typography variant="caption">
                          © 2023 Qoodish, All rights reserved.
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Paper>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%'
                    }}
                  >
                    <FbPage />
                  </Box>
                </Stack>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </>
  );
}

export default memo(Layout);
