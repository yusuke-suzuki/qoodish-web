import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  type AuthError,
  GoogleAuthProvider,
  getAuth,
  reauthenticateWithPopup,
  sendSignInLinkToEmail,
  verifyBeforeUpdateEmail
} from 'firebase/auth';
import { useRouter } from 'next/router';
import { memo, useCallback, useContext, useMemo, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import EmailField from '../common/EmailField';

type Props = {
  open: boolean;
  onClose: () => void;
};

type ReauthStep = 'idle' | 'google' | 'emailLink' | 'emailLinkSent';

function ChangeEmailDialog({ open, onClose }: Props) {
  const dictionary = useDictionary();
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [reauthStep, setReauthStep] = useState<ReauthStep>('idle');
  const [error, setError] = useState<string | null>(null);

  const hasGoogleProvider = useMemo(
    () =>
      currentUser?.providerData.some(
        (p) => p.providerId === GoogleAuthProvider.PROVIDER_ID
      ) ?? false,
    [currentUser]
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

  const basePath =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`;

  const attemptEmailUpdate = useCallback(async () => {
    if (!currentUser) return;

    const auth = getAuth();
    auth.languageCode = router.locale;

    await verifyBeforeUpdateEmail(currentUser, email, {
      url: `${window.location.origin}${basePath}/login`,
      handleCodeInApp: false
    });
    setSent(true);
  }, [currentUser, email, router.locale, basePath]);

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
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    const auth = getAuth();
    auth.languageCode = router.locale;

    try {
      await reauthenticateWithPopup(currentUser, new GoogleAuthProvider());
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
  }, [currentUser, router.locale, attemptEmailUpdate, getErrorMessage]);

  const handleSendReauthLink = useCallback(async () => {
    if (!currentUser?.email) return;

    setLoading(true);
    setError(null);

    const auth = getAuth();
    auth.languageCode = router.locale;

    try {
      window.localStorage.setItem('emailForReauth', currentUser.email);
      window.localStorage.setItem('pendingEmailChange', email);
      window.localStorage.setItem('reauthForEmailChange', 'true');

      await sendSignInLinkToEmail(auth, currentUser.email, {
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
  }, [currentUser, email, router.locale, basePath, getErrorMessage]);

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      slotProps={{
        transition: {
          onExited: handleExited
        }
      }}
    >
      <DialogTitle>{dictionary['change email']}</DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {sent || reauthStep === 'emailLinkSent'
            ? dictionary.close
            : dictionary.cancel}
        </Button>
        {reauthStep === 'google' && (
          <Button
            variant="contained"
            onClick={handleReauth}
            color="secondary"
            loading={loading}
          >
            {dictionary['sign in again']}
          </Button>
        )}
        {reauthStep === 'emailLink' && (
          <Button
            variant="contained"
            onClick={handleSendReauthLink}
            color="secondary"
            loading={loading}
          >
            {dictionary['send reauth link']}
          </Button>
        )}
        {!sent && reauthStep === 'idle' && (
          <Button
            variant="contained"
            onClick={handleSend}
            color="secondary"
            disabled={!email || !emailValid || !currentUser}
            loading={loading}
          >
            {dictionary['send verification email']}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default memo(ChangeEmailDialog);
