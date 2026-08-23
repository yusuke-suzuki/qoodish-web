import { Alert, DialogContentText } from '@mui/material';
import {
  type AuthError,
  GoogleAuthProvider,
  getAuth,
  reauthenticateWithPopup,
  sendSignInLinkToEmail,
  verifyBeforeUpdateEmail
} from 'firebase/auth';
import { useParams } from 'next/navigation';
import { memo, useCallback, useContext, useMemo, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import AppDialog, { type ConfirmAction } from '../common/AppDialog';
import EmailField from '../common/EmailField';

type Props = {
  open: boolean;
  onClose: () => void;
};

type ReauthStep = 'idle' | 'google' | 'emailLink' | 'emailLinkSent';

function ChangeEmailDialog({ open, onClose }: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();
  const { authenticated } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [reauthStep, setReauthStep] = useState<ReauthStep>('idle');
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: authenticated triggers re-read of getAuth().currentUser
  const hasGoogleProvider = useMemo(
    () =>
      (getAuth().currentUser?.providerData ?? []).some(
        (p) => p.providerId === GoogleAuthProvider.PROVIDER_ID
      ),
    [authenticated]
  );

  const handleEmailChange = useCallback((value: string, isValid: boolean) => {
    setEmail(value);
    setEmailValid(isValid);
  }, []);

  const getErrorMessage = useCallback(
    (errorCode: string): string => {
      switch (errorCode) {
        case 'auth/invalid-email':
          return dictionary['change email error invalid email'];
        case 'auth/requires-recent-login':
          return dictionary['change email error requires recent login'];
        case 'auth/email-already-in-use':
          return dictionary['change email error email already in use'];
        case 'auth/too-many-requests':
          return dictionary['email link error too many requests'];
        case 'auth/network-request-failed':
          return dictionary['email link error network request failed'];
        default:
          return dictionary['an error occurred'];
      }
    },
    [dictionary]
  );

  const basePath = `/${lang ?? 'en'}`;

  const attemptEmailUpdate = useCallback(async () => {
    const firebaseUser = getAuth().currentUser;
    if (!firebaseUser) return;

    const auth = getAuth();
    auth.languageCode = lang;

    await verifyBeforeUpdateEmail(firebaseUser, email, {
      url: `${window.location.origin}${basePath}/login`,
      handleCodeInApp: false
    });
    setSent(true);
  }, [email, lang, basePath]);

  const handleSend = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await attemptEmailUpdate();
    } catch (err) {
      console.error(err);
      const errorCode = (err as AuthError).code;
      if (errorCode === 'auth/requires-recent-login') {
        setReauthStep(hasGoogleProvider ? 'google' : 'emailLink');
      } else {
        setError(getErrorMessage(errorCode));
      }
    } finally {
      setLoading(false);
    }
  }, [attemptEmailUpdate, getErrorMessage, hasGoogleProvider]);

  const handleReauth = useCallback(async () => {
    const firebaseUser = getAuth().currentUser;
    if (!firebaseUser) return;

    setLoading(true);
    setError(null);

    const auth = getAuth();
    auth.languageCode = lang;

    try {
      await reauthenticateWithPopup(firebaseUser, new GoogleAuthProvider());
      setReauthStep('idle');
      await attemptEmailUpdate();
    } catch (err) {
      console.error(err);
      const errorCode = (err as AuthError).code;
      if (errorCode !== 'auth/popup-closed-by-user') {
        setError(getErrorMessage(errorCode));
        setReauthStep('idle');
      }
    } finally {
      setLoading(false);
    }
  }, [lang, attemptEmailUpdate, getErrorMessage]);

  const handleSendReauthLink = useCallback(async () => {
    const currentEmail = getAuth().currentUser?.email;
    if (!currentEmail) return;

    setLoading(true);
    setError(null);

    const auth = getAuth();
    auth.languageCode = lang;

    try {
      window.localStorage.setItem('emailForReauth', currentEmail);
      window.localStorage.setItem('pendingEmailChange', email);
      window.localStorage.setItem('reauthForEmailChange', 'true');

      await sendSignInLinkToEmail(auth, currentEmail, {
        url: `${window.location.origin}${basePath}/settings`,
        handleCodeInApp: true
      });
      setReauthStep('emailLinkSent');
    } catch (err) {
      console.error(err);
      window.localStorage.removeItem('emailForReauth');
      window.localStorage.removeItem('pendingEmailChange');
      window.localStorage.removeItem('reauthForEmailChange');
      setError(getErrorMessage((err as AuthError).code));
    } finally {
      setLoading(false);
    }
  }, [email, lang, basePath, getErrorMessage]);

  const handleExited = useCallback(() => {
    setEmail('');
    setEmailValid(true);
    setSent(false);
    setReauthStep('idle');
    setError(null);
    window.localStorage.removeItem('emailForReauth');
    window.localStorage.removeItem('pendingEmailChange');
    window.localStorage.removeItem('reauthForEmailChange');
  }, []);

  const confirmAction = useMemo<ConfirmAction | undefined>(() => {
    if (reauthStep === 'google') {
      return {
        label: dictionary['sign in again'],
        loading,
        onClick: handleReauth
      };
    }

    if (reauthStep === 'emailLink') {
      return {
        label: dictionary['send reauth link'],
        loading,
        onClick: handleSendReauthLink
      };
    }

    if (!sent && reauthStep === 'idle') {
      return {
        label: dictionary['send verification email'],
        loading,
        disabled: !email || !emailValid || !authenticated,
        onClick: handleSend
      };
    }

    return undefined;
  }, [
    reauthStep,
    sent,
    loading,
    email,
    emailValid,
    authenticated,
    dictionary,
    handleReauth,
    handleSendReauthLink,
    handleSend
  ]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['change email']}
      disableClose={loading}
      onExited={handleExited}
      cancelLabel={
        sent || reauthStep === 'emailLinkSent'
          ? dictionary.close
          : dictionary.cancel
      }
      confirmAction={confirmAction}
    >
      {sent ? (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            {dictionary['change email sent']}
          </Alert>
          <Alert severity="info">
            {dictionary['change email sent description']}
          </Alert>
        </>
      ) : reauthStep === 'emailLinkSent' ? (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            {dictionary['reauth email link sent']}
          </Alert>
          <Alert severity="info">
            {dictionary['reauth email link sent description']}
          </Alert>
        </>
      ) : reauthStep !== 'idle' ? (
        <>
          <DialogContentText sx={{ mb: 2 }}>
            {dictionary['reauth required detail']}
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </>
      ) : (
        <>
          <DialogContentText sx={{ mb: 2 }}>
            {dictionary['change email detail']}
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <EmailField
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
          />
        </>
      )}
    </AppDialog>
  );
}

export default memo(ChangeEmailDialog);
