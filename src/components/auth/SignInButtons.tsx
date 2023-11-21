import { Stack } from '@mui/material';
import { AuthError } from 'firebase/auth';
import { memo, useState } from 'react';
import LinkAccountDialog from './LinkAccountDialog';
import SignInWithFacebookButton from './SignInWithFacebookButton';
import SignInWithGoogleButton from './SignInWithGoogleButton';
import SignInWithTwitterButton from './SignInWithTwitterButton';

type Props = {
  onSignInSuccess: () => void;
};

function SignInButtons({ onSignInSuccess }: Props) {
  const [currentAuthError, setCurrentAuthError] = useState<AuthError | null>(
    null
  );

  return (
    <>
      <Stack spacing={1}>
        <SignInWithGoogleButton
          onSignInSuccess={onSignInSuccess}
          onSignInError={setCurrentAuthError}
        />
        <SignInWithFacebookButton
          onSignInSuccess={onSignInSuccess}
          onSignInError={setCurrentAuthError}
        />
        <SignInWithTwitterButton
          onSignInSuccess={onSignInSuccess}
          onSignInError={setCurrentAuthError}
        />
      </Stack>

      <LinkAccountDialog
        currentAuthError={currentAuthError}
        onSignInSuccess={onSignInSuccess}
      />
    </>
  );
}

export default memo(SignInButtons);
