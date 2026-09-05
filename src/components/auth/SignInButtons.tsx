import { Divider, Link as MuiLink, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import SignInWithEmailLinkButton from './SignInWithEmailLinkButton.tsx';
import SignInWithGoogleButton from './SignInWithGoogleButton.tsx';

type Props = {
  onSignInSuccess: () => void;
};

function SignInButtons({ onSignInSuccess }: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  const legalLinks: { [placeholder: string]: { href: string; label: string } } =
    {
      '{terms}': {
        href: localePath('/terms'),
        label: dictionary['terms of service']
      },
      '{privacy}': {
        href: localePath('/privacy'),
        label: dictionary['privacy policy']
      }
    };

  const [before, first, between, second, after] = dictionary[
    'agree to terms on sign in'
  ].split(/(\{terms\}|\{privacy\})/);

  const renderLink = (placeholder?: string) => {
    const link = placeholder ? legalLinks[placeholder] : undefined;

    return link ? (
      <MuiLink
        href={link.href}
        component={Link}
        target="_blank"
        underline="always"
        color="inherit"
      >
        {link.label}
      </MuiLink>
    ) : (
      placeholder
    );
  };

  return (
    <Stack spacing={2}>
      <SignInWithGoogleButton onSignInSuccess={onSignInSuccess} />
      <Divider>{dictionary.or}</Divider>
      <SignInWithEmailLinkButton />
      <Typography variant="caption" color="text.secondary">
        {before}
        {renderLink(first)}
        {between}
        {renderLink(second)}
        {after}
      </Typography>
    </Stack>
  );
}

export default memo(SignInButtons);
