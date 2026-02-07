import { Divider, Stack } from '@mui/material';
import type { AuthError } from 'firebase/auth';
import { memo, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';
import SignInWithEmailLinkButton from './SignInWithEmailLinkButton';
import SignInWithGoogleButton from './SignInWithGoogleButton';

type Props = {
  onSignInSuccess: () => void;
};

function SignInButtons({ onSignInSuccess }: Props) {
  const [, setCurrentAuthError] = useState<AuthError | null>(null);

  const dictionary = useDictionary();

  return (
    <Stack spacing={2}>
      <SignInWithGoogleButton
        onSignInSuccess={onSignInSuccess}
        onSignInError={setCurrentAuthError}
      />
      <Divider>{dictionary.or}</Divider>
      <SignInWithEmailLinkButton onSignInError={setCurrentAuthError} />
    </Stack>
  );
}

export default memo(SignInButtons);
