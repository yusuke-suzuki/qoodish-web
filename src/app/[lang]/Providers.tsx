'use client';

import { css } from '@emotion/react';
import {
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
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { Notification, Profile } from '../../../types';
import AuthProvider from '../../components/auth/AuthProvider';
import NotificationsContext from '../../context/NotificationsContext';
import ProfileContext from '../../context/ProfileContext';
import ServiceWorkerContext from '../../context/ServiceWorkerContext';
import useDictionary from '../../hooks/useDictionary';
import { usePushManager } from '../../hooks/usePushManager';
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
  serverProfile?: Profile | null;
  serverNotifications?: Notification[];
};

export default function Providers({
  children,
  lang,
  serverAuthenticated,
  serverUid,
  serverProfile,
  serverNotifications
}: Props) {
  const dictionary = useDictionary();

  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration>(null);

  usePushManager(registration);

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
            <ProfileContext.Provider value={serverProfile ?? null}>
              <NotificationsContext.Provider value={serverNotifications ?? []}>
                <ServiceWorkerContext.Provider value={{ registration }}>
                  <AnalyticsTracker />
                  {children}
                </ServiceWorkerContext.Provider>
              </NotificationsContext.Provider>
            </ProfileContext.Provider>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
