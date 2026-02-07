import { Button, type SxProps } from '@mui/material';
import { getAnalytics, logEvent } from 'firebase/analytics';
import {
  type AuthError,
  type GoogleAuthProvider,
  getAuth,
  signInWithPopup
} from 'firebase/auth';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, memo, useCallback, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  provider: GoogleAuthProvider;
  onSignInSuccess: () => void;
  sx: SxProps;
  startIcon: ReactNode;
  text: string;
};

function SignInWithProviderButton({
  provider,
  onSignInSuccess,
  sx,
  startIcon,
  text
}: Props) {
  const router = useRouter();
  const dictionary = useDictionary();

  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);

    const auth = getAuth();
    auth.languageCode = router.locale;

    try {
      await signInWithPopup(auth, provider);

      enqueueSnackbar(dictionary['sign in success'], {
        variant: 'success'
      });

      onSignInSuccess();

      const analytics = getAnalytics();
      logEvent(analytics, 'login', {
        provider: provider.providerId
      });
    } catch (error) {
      console.error(error);

      const errorCode = (error as AuthError).code;

      if (errorCode !== 'auth/popup-closed-by-user') {
        enqueueSnackbar(dictionary['an error occurred'], {
          variant: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [provider, router.locale, onSignInSuccess, dictionary]);

  return (
    <Button
      loading={loading}
      variant="contained"
      fullWidth
      sx={sx}
      onClick={handleClick}
      startIcon={startIcon}
    >
      {text}
    </Button>
  );
}

export default memo(SignInWithProviderButton);
