import { type AuthError, GoogleAuthProvider } from 'firebase/auth';
import { memo, useMemo } from 'react';
import GoogleIcon from '../common/GoogleIcon';
import SignInWithProviderButton from './SignInWithProviderButton';

type Props = {
  onSignInSuccess: () => void;
  onSignInError: (authError: AuthError) => void;
};

function SignInWithGoogleButton({ onSignInSuccess, onSignInError }: Props) {
  const provider = useMemo(() => {
    return new GoogleAuthProvider();
  }, []);

  return (
    <SignInWithProviderButton
      provider={provider}
      onSignInSuccess={onSignInSuccess}
      onSignInError={onSignInError}
      sx={{
        textTransform: 'none',
        backgroundColor: '#4285F4',
        '&:hover': {
          backgroundColor: '#357AE8'
        }
      }}
      text="Sign in with Google"
      startIcon={
        <GoogleIcon
          sx={{
            backgroundColor: 'white',
            borderRadius: '4px',
            width: 40,
            height: 40
          }}
        />
      }
    />
  );
}

export default memo(SignInWithGoogleButton);
