import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { type AuthError, getAuth, sendSignInLinkToEmail } from 'firebase/auth';
import { useParams } from 'next/navigation';
import { memo, useCallback, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';
import EmailField from '../common/EmailField';

type Props = {
  open: boolean;
  onClose: () => void;
};

function LinkEmailDialog({ open, onClose }: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basePath = `/${lang ?? 'en'}`;

  const handleEmailChange = useCallback((value: string, isValid: boolean) => {
    setEmail(value);
    setEmailValid(isValid);
  }, []);

  const getErrorMessage = useCallback(
    (errorCode: string): string => {
      switch (errorCode) {
        case 'auth/invalid-email':
          return dictionary['email link error invalid email'];
        case 'auth/too-many-requests':
          return dictionary['email link error too many requests'];
        case 'auth/operation-not-allowed':
          return dictionary['email link error operation not allowed'];
        case 'auth/network-request-failed':
          return dictionary['email link error network request failed'];
        default:
          return dictionary['an error occurred'];
      }
    },
    [dictionary]
  );

  const handleSend = useCallback(async () => {
    setLoading(true);
    setError(null);

    const auth = getAuth();
    auth.languageCode = lang;

    const actionCodeSettings = {
      url: `${window.location.origin}${basePath}/settings`,
      handleCodeInApp: true,
      linkDomain: window.location.hostname
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForLink', email);
      window.localStorage.setItem('linkProvider', 'true');
      setSent(true);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage((err as AuthError).code));
    } finally {
      setLoading(false);
    }
  }, [email, lang, basePath, getErrorMessage]);

  const handleExited = useCallback(() => {
    setEmail('');
    setEmailValid(true);
    setSent(false);
    setError(null);
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
      <DialogTitle>{dictionary['link email']}</DialogTitle>
      <DialogContent>
        {sent ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              {dictionary['link email sent']}
            </Alert>
            <Alert severity="info">
              {dictionary['email link sent description']}
            </Alert>
          </>
        ) : (
          <>
            <DialogContentText sx={{ mb: 2 }}>
              {dictionary['link email detail']}
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
          {sent ? dictionary.close : dictionary.cancel}
        </Button>
        {!sent && (
          <Button
            variant="contained"
            onClick={handleSend}
            color="secondary"
            disabled={!email || !emailValid}
            loading={loading}
          >
            {dictionary['send link']}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default memo(LinkEmailDialog);
