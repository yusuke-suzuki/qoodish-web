import { getAnalytics, logEvent } from 'firebase/analytics';
import { getApps, initializeApp } from 'firebase/app';
import {
  type User,
  getAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  signInWithEmailLink
} from 'firebase/auth';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, memo, useCallback, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  children: ReactNode;
};

function AuthProvider({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [signInRequired, setSignInRequired] = useState(false);

  const router = useRouter();
  const dictionary = useDictionary();

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

  const signIn = useCallback(async (user: User) => {
    const accessToken = await user.getIdToken();

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${accessToken}`);

    const request = new Request(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/users`,
      {
        method: 'POST',
        headers: headers
      }
    );

    const res = await fetch(request);

    if (res.ok) {
      setCurrentUser(user);
      setLoading(false);
    }
  }, []);

  const handleAuthStateChanged = useCallback(
    async (user: User) => {
      if (user) {
        if (user.isAnonymous) {
          await user.delete();

          setCurrentUser(null);
          setLoading(false);
        } else {
          await signIn(user);
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    },
    [signIn]
  );

  useEffect(() => {
    if (!getApps().length) {
      initFirebase();
    }

    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);

    return () => unsubscribe();
  }, [initFirebase, handleAuthStateChanged]);

  useEffect(() => {
    if (!router.isReady || !getApps().length) return;

    const auth = getAuth();
    const currentUrl = `${window.location.origin}${router.asPath}`;

    if (!isSignInWithEmailLink(auth, currentUrl)) return;

    let emailForSignIn = window.localStorage.getItem('emailForSignIn');

    if (!emailForSignIn) {
      emailForSignIn = window.prompt(dictionary['email link email']);
    }

    if (!emailForSignIn) return;

    signInWithEmailLink(auth, emailForSignIn, currentUrl)
      .then(() => {
        window.localStorage.removeItem('emailForSignIn');
        enqueueSnackbar(dictionary['sign in success'], {
          variant: 'success'
        });

        const analytics = getAnalytics();
        logEvent(analytics, 'login', { provider: 'email_link' });
      })
      .catch((err) => {
        console.error(err);
        enqueueSnackbar(dictionary['an error occured'], {
          variant: 'error'
        });
      });
  }, [router.isReady, router.asPath, dictionary]);

  return (
    <AuthContext.Provider
      value={{
        currentUser: currentUser,
        setCurrentUser: setCurrentUser,
        isLoading: loading,
        signInRequired: signInRequired,
        setSignInRequired: setSignInRequired
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default memo(AuthProvider);
