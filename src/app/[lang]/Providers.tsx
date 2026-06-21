'use client';

import { css } from '@emotion/react';
import {
  Box,
  Button,
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { amber, lightBlue } from '@mui/material/colors';
import { enUS, jaJP } from '@mui/material/locale';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import {
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { Notification, Profile } from '../../../types';
import AuthProvider from '../../components/auth/AuthProvider';
import FootprintsLoader from '../../components/common/FootprintsLoader';
import ServiceWorkerContext from '../../context/ServiceWorkerContext';
import useDictionary from '../../hooks/useDictionary';
import { usePushManager } from '../../hooks/usePushManager';
import AccountProviders from './AccountProviders';
import AnalyticsTracker from './AnalyticsTracker';

const globalStyles = css`
  .pac-container {
    z-index: 1300 !important;
  }
`;

const inputGlobalStyles = <GlobalStyles styles={globalStyles} />;

type Props = {
  children: ReactNode;
  lang: string;
  serverAuthenticated: boolean;
  serverUid?: string;
  profilePromise: Promise<Profile | null>;
  notificationsPromise: Promise<Notification[]>;
};

export default function Providers({
  children,
  lang,
  serverAuthenticated,
  serverUid,
  profilePromise,
  notificationsPromise
}: Props) {
  const dictionary = useDictionary();

  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration>(null);

  usePushManager(registration);

  const serviceWorkerValue = useMemo(() => ({ registration }), [registration]);

  const theme = useMemo(() => {
    const locale = lang === 'ja' ? jaJP : enUS;

    return createTheme(
      {
        palette: {
          primary: {
            light: amber[300],
            main: amber[500],
            dark: amber[700],
            contrastText: '#fff'
          },
          secondary: {
            light: lightBlue[300],
            main: lightBlue[500],
            dark: lightBlue[700],
            contrastText: '#fff'
          },
          background: {
            default: '#f1f1f1'
          }
        },
        typography: {
          fontFamily:
            'var(--font-shippori-mincho), "Hiragino Mincho ProN", "Yu Mincho", serif',
          h1: {
            fontFamily: 'var(--font-cinzel), var(--font-shippori-mincho), serif'
          },
          h2: {
            fontFamily: 'var(--font-cinzel), var(--font-shippori-mincho), serif'
          },
          h3: {
            fontFamily: 'var(--font-cinzel), var(--font-shippori-mincho), serif'
          },
          h4: {
            fontFamily: 'var(--font-cinzel), var(--font-shippori-mincho), serif'
          },
          h5: {
            fontFamily: 'var(--font-cinzel), var(--font-shippori-mincho), serif'
          },
          h6: {
            fontFamily: 'var(--font-cinzel), var(--font-shippori-mincho), serif'
          },
          body1: {
            lineHeight: 1.9,
            letterSpacing: '0.01em'
          },
          body2: {
            lineHeight: 1.8,
            letterSpacing: '0.01em'
          }
        }
      },
      locale
    );
  }, [lang]);

  const initServiceWorker = useCallback(async () => {
    try {
      const { Serwist } = await import('@serwist/window');
      const serwist = new Serwist('/sw.js', { scope: '/', type: 'classic' });

      serwist.addEventListener('installed', () => {
        console.log('ServiceWorker installed');
      });

      const reg = await serwist.register();
      console.log(
        'ServiceWorker registration successful with scope: ',
        reg?.scope
      );

      if (reg) {
        setRegistration(reg);
      }
    } catch (error) {
      console.log('ServiceWorker registration failed: ', error);
    }
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      initServiceWorker();
    }
  }, [initServiceWorker]);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {inputGlobalStyles}
        <SnackbarProvider
          preventDuplicate
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          action={(snackbarId) => (
            <Button onClick={() => closeSnackbar(snackbarId)}>
              {dictionary.close}
            </Button>
          )}
        >
          <AuthProvider
            serverAuthenticated={serverAuthenticated}
            serverUid={serverUid ?? null}
          >
            <Suspense
              fallback={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100vw',
                    height: '100vh',
                    bgcolor: 'background.default'
                  }}
                >
                  <FootprintsLoader label={dictionary.loading} />
                </Box>
              }
            >
              <AccountProviders
                profilePromise={profilePromise}
                notificationsPromise={notificationsPromise}
              >
                <ServiceWorkerContext.Provider value={serviceWorkerValue}>
                  <AnalyticsTracker />
                  {children}
                </ServiceWorkerContext.Provider>
              </AccountProviders>
            </Suspense>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
