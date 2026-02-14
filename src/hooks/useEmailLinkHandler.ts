import { getAnalytics, logEvent } from 'firebase/analytics';
import { getApps } from 'firebase/app';
import {
  type Auth,
  EmailAuthProvider,
  type User,
  getAuth,
  isSignInWithEmailLink,
  linkWithCredential,
  signInWithEmailLink
} from 'firebase/auth';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';
import useDictionary from './useDictionary';

type Dictionary = { [key: string]: string };

type Args = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
};

async function linkEmailProvider(
  currentUser: User,
  auth: Auth,
  currentUrl: string,
  setCurrentUser: (user: User | null) => void,
  dictionary: Dictionary
) {
  const emailForLink = window.localStorage.getItem('emailForLink');
  if (!emailForLink) return;

  try {
    const credential = EmailAuthProvider.credentialWithLink(
      emailForLink,
      currentUrl
    );
    await linkWithCredential(currentUser, credential);
    await currentUser.reload();
    setCurrentUser(auth.currentUser);

    window.localStorage.removeItem('emailForLink');
    window.localStorage.removeItem('linkProvider');
    enqueueSnackbar(dictionary['link provider success'], {
      variant: 'success'
    });

    logEvent(getAnalytics(), 'link_provider', {
      provider: EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD
    });
  } catch (err) {
    console.error(err);
    window.localStorage.removeItem('emailForLink');
    window.localStorage.removeItem('linkProvider');
    enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
  }
}

async function completeEmailSignIn(
  auth: Auth,
  currentUrl: string,
  dictionary: Dictionary
) {
  let email = window.localStorage.getItem('emailForSignIn');

  if (!email) {
    email = window.prompt(dictionary['email link prompt confirm email']);
  }

  if (!email) return;

  try {
    await signInWithEmailLink(auth, email, currentUrl);
    window.localStorage.removeItem('emailForSignIn');
    enqueueSnackbar(dictionary['sign in success'], { variant: 'success' });

    logEvent(getAnalytics(), 'login', {
      provider: EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD
    });
  } catch (err) {
    console.error(err);
    enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
  }
}

export default function useEmailLinkHandler({
  currentUser,
  setCurrentUser
}: Args) {
  const router = useRouter();
  const dictionary = useDictionary();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!router.isReady || !getApps().length) return;
    if (handledRef.current) return;

    const auth = getAuth();
    const currentUrl = `${window.location.origin}${router.asPath}`;

    if (!isSignInWithEmailLink(auth, currentUrl)) return;

    if (window.localStorage.getItem('linkProvider') === 'true') {
      if (currentUser) {
        handledRef.current = true;
        linkEmailProvider(
          currentUser,
          auth,
          currentUrl,
          setCurrentUser,
          dictionary
        );
      }
    } else {
      handledRef.current = true;
      completeEmailSignIn(auth, currentUrl, dictionary);
    }
  }, [currentUser, setCurrentUser, router.isReady, router.asPath, dictionary]);
}
