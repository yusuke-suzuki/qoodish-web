'use client';

import { KeyboardArrowLeft, Login } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Button,
  Container,
  Grid,
  Stack
} from '@mui/material';
import Link from 'next/link';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';

export default function NotFound() {
  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const { authenticated, isLoading, setSignInRequired } =
    useContext(AuthContext);

  // A private page answers a stranger with 404, so a reader without an
  // account is offered the way in beside the way back.
  const offerSignIn = !authenticated && !isLoading;

  return (
    <Container sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
          <Alert severity="warning">
            <AlertTitle>{dictionary['page not found']}</AlertTitle>
            {dictionary['page not found description']}
            {offerSignIn && ` ${dictionary['sign in if yours']}`}
          </Alert>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href={localePath('/discover')}
              color="primary"
              startIcon={<KeyboardArrowLeft />}
            >
              {dictionary['back to our site']}
            </Button>
            {offerSignIn && (
              <Button
                color="primary"
                startIcon={<Login />}
                onClick={() => setSignInRequired(true)}
              >
                {dictionary.login}
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
