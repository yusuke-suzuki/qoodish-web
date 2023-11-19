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
  useMediaQuery,
  useTheme
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ReactNode,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { AppMap } from '../../types';
import AuthContext from '../context/AuthContext';
import useDictionary from '../hooks/useDictionary';
import BottomNav from './layouts/BottomNav';
import FbPage from './layouts/FbPage';
import MiniDrawer from './layouts/MiniDrawer';
import MobileAppBar from './layouts/MobileAppBar';
import RecommendMaps from './layouts/RecommendMaps';
import SearchDialog from './layouts/SearchDialog';
import SignInRequiredDialog from './layouts/SignInRequiredDialog';
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
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const mdDown = useMediaQuery(theme.breakpoints.down('md'));

  const dictionary = useDictionary();

  const router = useRouter();

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

  const handleCreatedMap = useCallback((map: AppMap) => {
    setCreateMapDialogOpen(false);
    router.push(`/maps/${map.id}`);
  }, []);

  const showProgress = useCallback((_url, { shallow }) => {
    if (shallow) return;

    setLoading(true);
  }, []);

  const hideProgress = useCallback(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    router.events.on('routeChangeStart', showProgress);
    router.events.on('routeChangeComplete', hideProgress);
    router.events.on('routeChangeError', hideProgress);

    return () => {
      router.events.off('routeChangeStart', showProgress);
      router.events.off('routeChangeComplete', hideProgress);
      router.events.off('routeChangeError', hideProgress);
    };
  }, [showProgress, hideProgress, router.events]);

  return (
    <>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SignInRequiredDialog />
      <CreateMapDialog
        open={createMapDialogOpen}
        onClose={() => setCreateMapDialogOpen(false)}
        onSaved={handleCreatedMap}
      />

      {mdDown && (
        <>
          <MobileAppBar
            showBackButton={showBackButton}
            onSearchOpen={() => setSearchOpen(true)}
            onCreateMapClick={handleCreateMapClick}
          />

          <Box
            sx={{
              position: 'fixed',
              top: smUp ? theme.spacing(8) : theme.spacing(7),
              zIndex: 1101,
              width: '100%',
              display: loading ? 'block' : 'none',
              alignItems: 'center'
            }}
          >
            <LinearProgress color="secondary" />
          </Box>

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
        </>
      )}

      {mdUp && (
        <>
          <MiniDrawer
            onSearchOpen={() => setSearchOpen(true)}
            onCreateMapClick={handleCreateMapClick}
          />

          <Box
            sx={{
              position: 'fixed',
              top: 0,
              zIndex: 1201,
              width: '100%',
              display: loading ? 'block' : 'none',
              alignItems: 'center'
            }}
          >
            <LinearProgress color="secondary" />
          </Box>
        </>
      )}

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
              item
              xs={12}
              sm={12}
              md={fullWidth ? 12 : 8}
              lg={fullWidth ? 12 : 8}
              xl={fullWidth ? 12 : 8}
            >
              {children}
            </Grid>

            {mdUp && !fullWidth && (
              <Grid item md={4} lg={4} xl={4}>
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
