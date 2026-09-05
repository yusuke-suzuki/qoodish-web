'use client';

import { Refresh } from '@mui/icons-material';
import { Alert, AlertTitle, Button, Container, Grid } from '@mui/material';
import { useEffect } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: Props) {
  const dictionary = useDictionary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container sx={{ py: { xs: 2, md: 4 } }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
          <Alert severity="error">
            <AlertTitle>{dictionary['internal server error']}</AlertTitle>
            {dictionary['error page description']}
          </Alert>
          <Button
            color="primary"
            startIcon={<Refresh />}
            onClick={() => reset()}
          >
            {dictionary.retry}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
