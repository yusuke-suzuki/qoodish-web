import { getApps, initializeApp } from 'firebase/app';
import { type User, getAuth, onIdTokenChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  type ReactNode,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import AuthContext from '../../context/AuthContext';
import useEmailLinkHandler from '../../hooks/useEmailLinkHandler';

type Props = {
  children: ReactNode;
  serverAuthenticated: boolean;
  serverUid: string | null;
};

if (!getApps().length) {
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  });
}

function AuthProvider({ children, serverAuthenticated, serverUid }: Props) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(serverAuthenticated);
  const [uid, setUid] = useState<string | null>(serverUid);
  const [loading, setLoading] = useState(true);
  const [signInRequired, setSignInRequired] = useState(false);
  const authStateRef = useRef(serverAuthenticated);
  const pendingRegistrationRef = useRef(false);

  useEmailLinkHandler({ isLoading: loading });

  const syncSessionCookie = useCallback(async (idToken: string | null) => {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
  }, []);

  const clearNavigationCache = useCallback(async () => {
    if (typeof caches !== 'undefined') {
      await caches.delete('pages');
    }
  }, []);

  const registerBackendUser = useCallback(async () => {
    // Retry across the API's cold start; delays add up to ~30s on top of
    // the proxy's own 30s timeout per attempt.
    const retryDelays = [1000, 2000, 4000, 8000, 16000];

    for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
      try {
        const res = await fetch('/api/v1/users', { method: 'POST' });

        if (res.ok) {
          return true;
        }

        if (res.status < 500) {
          return false;
        }
      } catch (error) {
        console.error('Failed to register backend user:', error);
      }

      if (attempt < retryDelays.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelays[attempt])
        );
      }
    }

    return false;
  }, []);

  const handleIdTokenChanged = useCallback(
    async (user: User | null) => {
      try {
        if (user) {
          if (user.isAnonymous) {
            await user.delete();

            setAuthenticated(false);
            setUid(null);
            setLoading(false);

            if (authStateRef.current) {
              authStateRef.current = false;
              await clearNavigationCache();
              router.refresh();
            }
          } else {
            const accessToken = await user.getIdToken();
            await syncSessionCookie(accessToken);

            setAuthenticated(true);
            setUid(user.uid);
            setLoading(false);

            if (!authStateRef.current) {
              authStateRef.current = true;
              pendingRegistrationRef.current = !(await registerBackendUser());
              await clearNavigationCache();
              router.refresh();
            } else if (pendingRegistrationRef.current) {
              pendingRegistrationRef.current = !(await registerBackendUser());

              if (!pendingRegistrationRef.current) {
                await clearNavigationCache();
                router.refresh();
              }
            }
          }
        } else {
          await syncSessionCookie(null);

          pendingRegistrationRef.current = false;

          setAuthenticated(false);
          setUid(null);
          setLoading(false);

          if (authStateRef.current) {
            authStateRef.current = false;
            await clearNavigationCache();
            router.refresh();
          }
        }
      } catch (error) {
        console.error('Failed to handle auth state change:', error);
        setLoading(false);
      }
    },
    [syncSessionCookie, clearNavigationCache, registerBackendUser, router]
  );

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onIdTokenChanged(auth, handleIdTokenChanged);
    return () => unsubscribe();
  }, [handleIdTokenChanged]);

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        uid,
        isLoading: loading,
        signInRequired,
        setSignInRequired
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default memo(AuthProvider);
