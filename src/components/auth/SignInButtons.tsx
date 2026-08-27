import { Divider, Stack } from '@mui/material';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import SignInWithEmailLinkButton from './SignInWithEmailLinkButton.tsx';
import SignInWithGoogleButton from './SignInWithGoogleButton.tsx';

type Props = {
  onSignInSuccess: () => void;
};

function SignInButtons({ onSignInSuccess }: Props) {
  const dictionary = useDictionary();

  return (
    <Stack spacing={2}>
      <SignInWithGoogleButton onSignInSuccess={onSignInSuccess} />
      <Divider>{dictionary.or}</Divider>
      <SignInWithEmailLinkButton />
    </Stack>
  );
}

export default memo(SignInButtons);
