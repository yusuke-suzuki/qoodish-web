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
import type { ServerAuthState } from '../../lib/auth';

type Props = {
  children: ReactNode;
  authStatePromise: Promise<ServerAuthState>;
};

if (!getApps().length) {
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  });
}

function AuthProvider({ children, authStatePromise }: Props) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInRequired, setSignInRequired] = useState(false);
  const authStateRef = useRef(false);
  const listenerFiredRef = useRef(false);

  useEmailLinkHandler({ isLoading: loading });

  const syncSessionCookie = useCallback(async (idToken: string | null) => {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
  }, []);

  const handleIdTokenChanged = useCallback(
    async (user: User | null) => {
      listenerFiredRef.current = true;

      if (user) {
        if (user.isAnonymous) {
          await user.delete();

          setAuthenticated(false);
          setUid(null);
          setLoading(false);

          if (authStateRef.current) {
            authStateRef.current = false;
            router.refresh();
          }
        } else {
          const accessToken = await user.getIdToken();
          await syncSessionCookie(accessToken);

          if (!authStateRef.current) {
            await fetch('/api/v1/users', { method: 'POST' });
            authStateRef.current = true;
            router.refresh();
          }

          setAuthenticated(true);
          setUid(user.uid);
          setLoading(false);
        }
      } else {
        await syncSessionCookie(null);

        setAuthenticated(false);
        setUid(null);
        setLoading(false);

        if (authStateRef.current) {
          authStateRef.current = false;
          router.refresh();
        }
      }
    },
    [syncSessionCookie, router]
  );

  useEffect(() => {
    let cancelled = false;
    authStatePromise.then((state) => {
      if (cancelled || listenerFiredRef.current) {
        return;
      }
      authStateRef.current = state.authenticated;
      setAuthenticated(state.authenticated);
      setUid(state.uid ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [authStatePromise]);

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
