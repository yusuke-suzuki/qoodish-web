import { getApps, initializeApp } from 'firebase/app';
import {
  type User,
  type UserInfo,
  getAuth,
  onAuthStateChanged
} from 'firebase/auth';
import { type ReactNode, memo, useCallback, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import useEmailLinkHandler from '../../hooks/useEmailLinkHandler';

type Props = {
  children: ReactNode;
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

function AuthProvider({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [providerData, setProviderData] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [signInRequired, setSignInRequired] = useState(false);

  useEffect(() => {
    setProviderData([...(currentUser?.providerData ?? [])]);
  }, [currentUser]);

  useEmailLinkHandler({ currentUser, setProviderData });

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
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
    return () => unsubscribe();
  }, [handleAuthStateChanged]);

  return (
    <AuthContext.Provider
      value={{
        currentUser: currentUser,
        setCurrentUser: setCurrentUser,
        providerData: providerData,
        setProviderData: setProviderData,
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
