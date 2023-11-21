import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import { memo, useCallback } from 'react';
import useDictionary from '../../hooks/useDictionary';
import SignInButtons from './SignInButtons';

export default memo(function LoginCard() {
  const dictionary = useDictionary();
  const router = useRouter();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleSignInSuccess = useCallback(() => {
    router.push('/discover');
  }, []);

  return (
    <Stack spacing={2}>
      <Typography
        variant={mdUp ? 'h3' : 'h4'}
        component="h1"
        color="white"
        align="center"
      >
        {dictionary['create map together']}
      </Typography>

      <Typography
        variant={mdUp ? 'subtitle1' : 'subtitle2'}
        component="p"
        color="white"
        align="center"
      >
        {dictionary['start new adventure']}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <SignInButtons onSignInSuccess={handleSignInSuccess} />
      </Box>
    </Stack>
  );
});
