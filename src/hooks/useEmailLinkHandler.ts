import { getAnalytics, logEvent } from 'firebase/analytics';
import { getApps } from 'firebase/app';
import {
  type Auth,
  EmailAuthProvider,
  type User,
  type UserInfo,
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
  currentUser: User | null;
  setProviderData: (data: UserInfo[]) => void;
};

async function linkEmailProvider(
  currentUser: User,
  currentUrl: string,
  setProviderData: (data: UserInfo[]) => void,
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
    setProviderData([...currentUser.providerData]);

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
  currentUser: User,
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
    await reauthenticateWithCredential(currentUser, credential);
    await verifyBeforeUpdateEmail(currentUser, pendingEmailChange, {
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

export default function useEmailLinkHandler({
  currentUser,
  setProviderData
}: Args) {
  const params = useParams<{ lang: string }>();
  const dictionary = useDictionary();
  const handledRef = useRef(false);

  const lang = params?.lang ?? 'en';
  const basePath = `/${lang}`;

  useEffect(() => {
    if (!getApps().length) return;
    if (handledRef.current) return;

    const auth = getAuth();
    const currentUrl = window.location.href;

    if (!isSignInWithEmailLink(auth, currentUrl)) return;

    if (window.localStorage.getItem('reauthForEmailChange') === 'true') {
      if (currentUser) {
        handledRef.current = true;
        reauthAndChangeEmail(currentUser, currentUrl, basePath, dictionary);
      }
    } else if (window.localStorage.getItem('linkProvider') === 'true') {
      if (currentUser) {
        handledRef.current = true;
        linkEmailProvider(currentUser, currentUrl, setProviderData, dictionary);
      }
    } else {
      handledRef.current = true;
      completeEmailSignIn(auth, currentUrl, dictionary);
    }
  }, [currentUser, setProviderData, basePath, dictionary]);
}
