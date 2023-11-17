import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { ReactNode, memo, useCallback, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { getApps, initializeApp } from 'firebase/app';
import { enqueueSnackbar } from 'notistack';
import useDictionary from '../hooks/useDictionary';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { useRouter } from 'next/router';

type Props = {
  children: ReactNode;
};

function AuthProvider({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [signInRequired, setSignInRequired] = useState(false);

  const dictionary = useDictionary();
  const router = useRouter();

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

  const signIn = useCallback(
    async (user: User) => {
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
    },
    [dictionary]
  );

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
