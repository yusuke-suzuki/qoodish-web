import { getAnalytics, logEvent } from 'firebase/analytics';
import { getApps } from 'firebase/app';
import {
  type Auth,
  EmailAuthProvider,
  type User,
  getAuth,
  isSignInWithEmailLink,
  linkWithCredential,
  reauthenticateWithCredential,
  signInWithEmailLink,
  verifyBeforeUpdateEmail
} from 'firebase/auth';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';
import useDictionary from './useDictionary';

type Dictionary = { [key: string]: string };

type Args = {
  isLoading: boolean;
};

async function linkEmailProvider(
  user: User,
  currentUrl: string,
  dictionary: Dictionary
) {
  const emailForLink = window.localStorage.getItem('emailForLink');
  if (!emailForLink) return;

  try {
    const credential = EmailAuthProvider.credentialWithLink(
      emailForLink,
      currentUrl
    );
    await linkWithCredential(user, credential);
    await user.reload();

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

async function reauthAndChangeEmail(
  user: User,
  currentUrl: string,
  basePath: string,
  dictionary: Dictionary
) {
  const emailForReauth = window.localStorage.getItem('emailForReauth');
  const pendingEmailChange = window.localStorage.getItem('pendingEmailChange');

  window.localStorage.removeItem('emailForReauth');
  window.localStorage.removeItem('pendingEmailChange');
  window.localStorage.removeItem('reauthForEmailChange');

  if (!emailForReauth || !pendingEmailChange) return;

  try {
    const credential = EmailAuthProvider.credentialWithLink(
      emailForReauth,
      currentUrl
    );
    await reauthenticateWithCredential(user, credential);
    await verifyBeforeUpdateEmail(user, pendingEmailChange, {
      url: `${window.location.origin}${basePath}/login`,
      handleCodeInApp: false
    });
    enqueueSnackbar(dictionary['change email sent'], { variant: 'success' });
  } catch (err) {
    console.error(err);
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

export default function useEmailLinkHandler({ isLoading }: Args) {
  const params = useParams<{ lang: string }>();
  const dictionary = useDictionary();
  const handledRef = useRef(false);

  const lang = params?.lang ?? 'en';
  const basePath = `/${lang}`;

  useEffect(() => {
    if (isLoading) return;
    if (!getApps().length) return;
    if (handledRef.current) return;

    const auth = getAuth();
    const currentUrl = window.location.href;

    if (!isSignInWithEmailLink(auth, currentUrl)) return;

    const firebaseUser = auth.currentUser;

    if (window.localStorage.getItem('reauthForEmailChange') === 'true') {
      if (firebaseUser) {
        handledRef.current = true;
        reauthAndChangeEmail(firebaseUser, currentUrl, basePath, dictionary);
      }
    } else if (window.localStorage.getItem('linkProvider') === 'true') {
      if (firebaseUser) {
        handledRef.current = true;
        linkEmailProvider(firebaseUser, currentUrl, dictionary);
      }
    } else {
      handledRef.current = true;
      completeEmailSignIn(auth, currentUrl, dictionary);
    }
  }, [isLoading, basePath, dictionary]);
}
