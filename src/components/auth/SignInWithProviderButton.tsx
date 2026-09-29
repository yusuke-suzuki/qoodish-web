import { Button, type SxProps } from '@mui/material';
import {
  type AuthError,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  getAuth,
  signInWithPopup
} from 'firebase/auth';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, type ReactNode, useCallback, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import { trackEvent } from '../../utils/analytics.ts';
import { authEvent } from '../../utils/authEvent.ts';

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
  const { lang } = useParams<{ lang: string }>();
  const dictionary = useDictionary();

  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);

    const auth = getAuth();
    auth.languageCode = lang;

    try {
      const credential = await signInWithPopup(auth, provider);

      enqueueSnackbar(dictionary['sign in success'], {
        variant: 'success'
      });

      onSignInSuccess();

      trackEvent(
        authEvent(
          getAdditionalUserInfo(credential)?.isNewUser ?? false,
          GoogleAuthProvider.PROVIDER_ID
        )
      );
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
  }, [provider, lang, onSignInSuccess, dictionary]);

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
