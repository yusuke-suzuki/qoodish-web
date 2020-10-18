import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { jaJP, enUS, Localization } from '@material-ui/core/locale';
import { ApiClient } from '@yusuke-suzuki/qoodish-api-js-client';
import { amber, lightBlue } from '@material-ui/core/colors';
import I18n from '../utils/I18n';
import AuthContext from '../context/AuthContext';

import { StoreContext } from 'redux-react-hook';
import configureStore from '../configureStore';
import AppPortal from '../components/AppPortal';

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  User
} from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';
import ServiceWorkerContext from '../context/ServiceWorkerContext';

const { store } = configureStore();

export default function CustomApp({ Component, pageProps }: AppProps) {
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>(
    null
  );
  const [locale, setLocale] = useState<Localization>(enUS);

  const router = useRouter();
  const { hl } = router.query;

  const theme = useMemo(() => {
    return createMuiTheme(
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
  }, [locale]);

  const measurePageView = useCallback(
    path => {
      const analytics = getAnalytics();

      logEvent(analytics, 'page_view', {
        page_path: path
      });
    },
    [logEvent, getAnalytics]
  );

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
  }, [initializeApp]);

  const initServiceWorker = useCallback(async () => {
    const { Workbox } = await import('workbox-window');
    const wb = new Workbox('/sw.js');
    const reg = await wb.register();

    console.log(
      'ServiceWorker registration successful with scope: ',
      reg.scope
    );

    setRegistration(reg);
  }, []);

  const switchLocale = useCallback(() => {
    I18n.locale =
      hl ||
      window.navigator.language ||
      window.navigator['userLanguage'] ||
      window.navigator['browserLanguage'];

    if (I18n.locale.includes('ja')) {
      setLocale(jaJP);
    } else {
      setLocale(enUS);
    }
  }, [hl, jaJP, enUS]);

  const initApiClient = useCallback(() => {
    const defaultClient = ApiClient.instance;
    defaultClient.basePath = process.env.NEXT_PUBLIC_API_ENDPOINT;
  }, []);

  const handleAuthStateChanged = useCallback(
    async (user: User) => {
      if (user) {
        setCurrentUser(user);
      } else {
        const auth = getAuth();
        await signInAnonymously(auth);
      }
    },
    [getAuth, signInAnonymously]
  );

  useEffect(() => {
    // Fires when the query parameters are completely initialized
    if (router.isReady) {
      switchLocale();
    }
  }, [router.isReady]);

  useEffect(() => {
    router.events.on('routeChangeComplete', measurePageView);

    return () => {
      router.events.off('routeChangeComplete', measurePageView);
    };
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      initServiceWorker();
    }
  }, []);

  useEffect(() => {
    if (!getApps().length) {
      initFirebase();
    }

    initApiClient();

    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);

    return () => unsubscribe();
  }, []);

  return (
    <StoreContext.Provider value={store}>
      <ThemeProvider theme={theme}>
        <AuthContext.Provider
          value={{
            currentUser: currentUser,
            setCurrentUser: setCurrentUser
          }}
        >
          <ServiceWorkerContext.Provider
            value={{
              registration: registration
            }}
          >
            <AppPortal>
              <Component {...pageProps} />
            </AppPortal>
          </ServiceWorkerContext.Provider>
        </AuthContext.Provider>
      </ThemeProvider>
    </StoreContext.Provider>
  );
}
