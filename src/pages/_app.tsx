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
import AuthContext from '../context/AuthContext';

import { getAnalytics, logEvent } from 'firebase/analytics';
import { getApps, initializeApp } from 'firebase/app';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import ServiceWorkerContext from '../context/ServiceWorkerContext';

import { CacheProvider, EmotionCache, css } from '@emotion/react';
import {
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { amber, lightBlue } from '@mui/material/colors';
import { enUS, jaJP } from '@mui/material/locale';
import { NextPage } from 'next';
import { SnackbarProvider } from 'notistack';
import createEmotionCache from '../../createEmotionCache';
import SWRContainer from '../components/SWRContainer';
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
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [signInRequired, setSignInRequired] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration>(null);

  usePushManager(registration);

  const router = useRouter();

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

  const initFirebase = useCallback(() => {
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
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

  const handleAuthStateChanged = useCallback(async (user: User) => {
    if (user) {
      if (user.isAnonymous) {
        await user.delete();
        setCurrentUser(null);
      } else {
        setCurrentUser(user);
      }

      setIsLoading(false);
    } else {
      setCurrentUser(null);
      setIsLoading(false);
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

  useEffect(() => {
    if (!getApps().length) {
      initFirebase();
    }

    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);

    return () => unsubscribe();
  }, [initFirebase, handleAuthStateChanged]);

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {inputGlobalStyles}
        <SnackbarProvider
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <AuthContext.Provider
            value={{
              currentUser: currentUser,
              setCurrentUser: setCurrentUser,
              isLoading: isLoading,
              signInRequired: signInRequired,
              setSignInRequired: setSignInRequired
            }}
          >
            <ServiceWorkerContext.Provider
              value={{
                registration: registration
              }}
            >
              <SWRContainer>
                {getLayout(<Component {...pageProps} />)}
              </SWRContainer>
            </ServiceWorkerContext.Provider>
          </AuthContext.Provider>
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
