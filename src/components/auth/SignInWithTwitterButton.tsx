import { Twitter } from '@mui/icons-material';
import { AuthError, TwitterAuthProvider } from 'firebase/auth';
import { memo, useMemo } from 'react';
import SignInWithProviderButton from './SignInWithProviderButton';

type Props = {
  onSignInSuccess: () => void;
  onSignInError: (authError: AuthError) => void;
};

function SignInWithTwitterButton({ onSignInSuccess, onSignInError }: Props) {
  const provider = useMemo(() => {
    return new TwitterAuthProvider();
  }, []);

  return (
    <SignInWithProviderButton
      provider={provider}
      onSignInSuccess={onSignInSuccess}
      onSignInError={onSignInError}
      sx={{
        textTransform: 'none',
        backgroundColor: '#1D9BF0',
        '&:hover': {
          backgroundColor: '#1A8CEB'
        }
      }}
      text="Sign in with Twitter"
      startIcon={<Twitter />}
    />
  );
}

export default memo(SignInWithTwitterButton);
