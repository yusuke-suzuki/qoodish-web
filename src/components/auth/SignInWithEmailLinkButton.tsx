import { LoadingButton } from '@mui/lab';
import { Alert, Stack, TextField } from '@mui/material';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { type AuthError, getAuth, sendSignInLinkToEmail } from 'firebase/auth';
import { useRouter } from 'next/router';
import { type FormEvent, memo, useCallback, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  onSignInError: (error: AuthError) => void;
};

function SignInWithEmailLinkButton({ onSignInError }: Props) {
  const router = useRouter();
  const dictionary = useDictionary();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = useCallback(
    (errorCode: string): string => {
      switch (errorCode) {
        case 'auth/invalid-email':
          return dictionary['email link error invalid email'];
        case 'auth/too-many-requests':
          return dictionary['email link error too many requests'];
        case 'auth/operation-not-allowed':
          return dictionary['email link error operation not allowed'];
        case 'auth/expired-action-code':
          return dictionary['email link error expired'];
        case 'auth/invalid-action-code':
          return dictionary['email link error invalid link'];
        case 'auth/network-request-failed':
          return dictionary['email link error network request failed'];
        default:
          return dictionary['an error occurred'];
      }
    },
    [dictionary]
  );

  const handleSendLink = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const auth = getAuth();
      auth.languageCode = router.locale;

      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
        linkDomain: window.location.hostname
      };

      try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        setSent(true);

        const analytics = getAnalytics();
        logEvent(analytics, 'email_link_sent');
      } catch (err) {
        console.error(err);
        const errorMessage = getErrorMessage((err as AuthError).code);
        setError(errorMessage);
        onSignInError(err as AuthError);
      } finally {
        setLoading(false);
      }
    },
    [email, router.locale, onSignInError, getErrorMessage]
  );

  if (sent) {
    return (
      <Stack spacing={2} sx={{ width: '100%' }}>
        <Alert severity="success">{dictionary['email link sent']}</Alert>
        <Alert severity="info">
          {dictionary['email link sent description']}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack
      component="form"
      onSubmit={handleSendLink}
      spacing={2}
      sx={{ width: '100%' }}
    >
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label={dictionary['email link email']}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        disabled={loading}
        variant="outlined"
      />

      <LoadingButton
        type="submit"
        loading={loading}
        variant="contained"
        fullWidth
        disabled={!email}
      >
        {dictionary['email link send']}
      </LoadingButton>
    </Stack>
  );
}

export default memo(SignInWithEmailLinkButton);
