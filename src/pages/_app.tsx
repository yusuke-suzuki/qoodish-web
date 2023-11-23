import { getAnalytics, logEvent } from 'firebase/analytics';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import ServiceWorkerContext from '../context/ServiceWorkerContext';

import { CacheProvider, EmotionCache, css } from '@emotion/react';
import {
  Button,
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { amber, lightBlue } from '@mui/material/colors';
import { enUS, jaJP } from '@mui/material/locale';
import { NextPage } from 'next';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import createEmotionCache from '../../createEmotionCache';
import SWRContainer from '../components/SWRContainer';
import AuthProvider from '../components/auth/AuthProvider';
import useDictionary from '../hooks/useDictionary';
import { usePushManager } from '../hooks/usePushManager';

const globalStyles = css`
  .pac-container {
    z-index: 1300 !important;
  }
`;

const inputGlobalStyles = <GlobalStyles styles={globalStyles} />;

const clientSideEmotionCache = createEmotionCache();

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  emotionCache?: EmotionCache;
};

export default function CustomApp({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps
}: AppPropsWithLayout) {
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration>(null);

  usePushManager(registration);

  const router = useRouter();
  const dictionary = useDictionary();

  const theme = useMemo(() => {
    const locale = router.locale === 'ja' ? jaJP : enUS;

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
  }, [router.locale]);

  const measurePageView = useCallback((path) => {
    const analytics = getAnalytics();

    logEvent(analytics, 'page_view', {
      page_path: path
    });
  }, []);

  const initServiceWorker = useCallback(async () => {
    try {
      const { Workbox } = await import('workbox-window');
      const wb = new Workbox('/sw.js');
      const reg = await wb.register();

      console.log(
        'ServiceWorker registration successful with scope: ',
        reg.scope
      );

      setRegistration(reg);
    } catch (error) {
      console.log('ServiceWorker registration failed: ', error);
    }
  }, []);

  useEffect(() => {
    router.events.on('routeChangeComplete', measurePageView);

    return () => {
      router.events.off('routeChangeComplete', measurePageView);
    };
  }, [router.events, measurePageView]);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      initServiceWorker();
    }
  }, [initServiceWorker]);

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {inputGlobalStyles}
        <SnackbarProvider
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          action={(snackbarId) => (
            <Button onClick={() => closeSnackbar(snackbarId)}>
              {dictionary.close}
            </Button>
          )}
        >
          <AuthProvider>
            <ServiceWorkerContext.Provider
              value={{
                registration: registration
              }}
            >
              <SWRContainer>
                {getLayout(<Component {...pageProps} />)}
              </SWRContainer>
            </ServiceWorkerContext.Provider>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
