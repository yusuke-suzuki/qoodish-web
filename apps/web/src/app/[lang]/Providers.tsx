'use client';

import { css } from '@emotion/react';
import {
  Button,
  CssBaseline,
  GlobalStyles,
  ThemeProvider
} from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import type { Serwist } from '@serwist/window';
import { closeSnackbar, enqueueSnackbar, SnackbarProvider } from 'notistack';
import {
  type ReactNode,
  useEffect,
  useEffectEvent,
  useMemo,
  useState
} from 'react';
import type {
  CursorPage,
  Notification,
  Profile
} from '../../../types/index.ts';
import AuthProvider from '../../components/auth/AuthProvider.tsx';
import ClientErrorReporter from '../../components/common/ClientErrorReporter.tsx';
import DictionaryContext from '../../context/DictionaryContext.ts';
import ServiceWorkerContext from '../../context/ServiceWorkerContext.ts';
import { usePushManager } from '../../hooks/usePushManager.ts';
import type { Dictionary } from '../../utils/getDictionary.ts';
import { createAppTheme } from '../../utils/theme.ts';
import AccountProviders from './AccountProviders.tsx';

const globalStyles = css`
  .pac-container {
    z-index: 1300 !important;
  }
`;

const inputGlobalStyles = <GlobalStyles styles={globalStyles} />;

function activateWaitingWorker(
  serwist: Serwist,
  waitingWorker?: ServiceWorker
) {
  if (waitingWorker?.state !== 'installed') {
    window.location.reload();
    return;
  }

  serwist.addEventListener('controlling', () => window.location.reload());
  serwist.messageSkipWaiting();
}

type Props = {
  children: ReactNode;
  lang: string;
  dictionary: Dictionary;
  serverAuthenticated: boolean;
  serverPending: boolean;
  serverUid?: string;
  profilePromise: Promise<Profile | null>;
  unreadNotificationsPromise: Promise<CursorPage<Notification>>;
};

export default function Providers({
  children,
  lang,
  dictionary,
  serverAuthenticated,
  serverPending,
  serverUid,
  profilePromise,
  unreadNotificationsPromise
}: Props) {
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  usePushManager(registration);

  const serviceWorkerValue = useMemo(() => ({ registration }), [registration]);

  const theme = useMemo(() => createAppTheme(lang), [lang]);

  const offerUpdate = useEffectEvent((activateUpdate: () => void) => {
    enqueueSnackbar(dictionary['new version available'], {
      persist: true,
      action: (snackbarId) => (
        <>
          <Button
            onClick={() => {
              closeSnackbar(snackbarId);
              activateUpdate();
            }}
          >
            {dictionary.reload}
          </Button>
          <Button onClick={() => closeSnackbar(snackbarId)}>
            {dictionary.close}
          </Button>
        </>
      )
    });
  });

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const initServiceWorker = async () => {
      const { Serwist } = await import('@serwist/window');
      const serwist = new Serwist('/sw.js', { scope: '/', type: 'classic' });

      serwist.addEventListener('waiting', ({ sw, isExternal }) => {
        if (!isExternal) return;

        offerUpdate(() => activateWaitingWorker(serwist, sw));
      });

      const reg = await serwist.register();

      if (!reg || !('PushManager' in window)) {
        return;
      }

      // register() resolves while the worker is still installing, and the push
      // API rejects a subscription until one is active; ready holds until then.
      setRegistration(await navigator.serviceWorker.ready);
    };

    initServiceWorker().catch((error) => {
      console.log('ServiceWorker registration failed: ', error);
    });
  }, []);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {inputGlobalStyles}
        <DictionaryContext.Provider value={dictionary}>
          <SnackbarProvider
            preventDuplicate
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            action={(snackbarId) => (
              <Button onClick={() => closeSnackbar(snackbarId)}>
                {dictionary.close}
              </Button>
            )}
          >
            <ClientErrorReporter />
            <AuthProvider
              serverAuthenticated={serverAuthenticated}
              serverPending={serverPending}
              serverUid={serverUid ?? null}
            >
              <AccountProviders
                profilePromise={profilePromise}
                unreadNotificationsPromise={unreadNotificationsPromise}
              >
                <ServiceWorkerContext.Provider value={serviceWorkerValue}>
                  {children}
                </ServiceWorkerContext.Provider>
              </AccountProviders>
            </AuthProvider>
          </SnackbarProvider>
        </DictionaryContext.Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
