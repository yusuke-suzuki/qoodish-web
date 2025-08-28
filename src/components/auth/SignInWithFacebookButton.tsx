import { Facebook } from '@mui/icons-material';
import { type AuthError, FacebookAuthProvider } from 'firebase/auth';
import { memo, useMemo } from 'react';
import SignInWithProviderButton from './SignInWithProviderButton';

type Props = {
  onSignInSuccess: () => void;
  onSignInError: (authError: AuthError) => void;
};

function SignInWithFacebookButton({ onSignInSuccess, onSignInError }: Props) {
  const provider = useMemo(() => {
    return new FacebookAuthProvider();
  }, []);

  return (
    <SignInWithProviderButton
      provider={provider}
      onSignInSuccess={onSignInSuccess}
      onSignInError={onSignInError}
      sx={{
        textTransform: 'none',
        backgroundColor: '#1877F2',
        '&:hover': {
          backgroundColor: '#166FE5'
        }
      }}
      text="Sign in with Facebook"
      startIcon={<Facebook />}
    />
  );
}

export default memo(SignInWithFacebookButton);
