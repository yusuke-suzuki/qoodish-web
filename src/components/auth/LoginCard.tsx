import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useRouter } from 'next/router';
import { memo, useCallback } from 'react';
import useDictionary from '../../hooks/useDictionary';
import SignInButtons from './SignInButtons';

export default memo(function LoginCard() {
  const dictionary = useDictionary();
  const { push } = useRouter();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleSignInSuccess = useCallback(() => {
    push('/discover');
  }, [push]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography
            align="center"
            variant={mdUp ? 'h5' : 'h6'}
            component="div"
          >
            {dictionary.login}
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
      </CardContent>
    </Card>
  );
});
