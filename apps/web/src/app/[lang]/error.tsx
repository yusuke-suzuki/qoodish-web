'use client';

import { Refresh } from '@mui/icons-material';
import { Alert, AlertTitle, Button, Container, Grid } from '@mui/material';
import { useEffect, useTransition } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import reportClientError from '../../utils/reportClientError.ts';

type Props = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ErrorPage({ error, retry }: Props) {
  const dictionary = useDictionary();
  const [retrying, startRetry] = useTransition();

  useEffect(() => {
    reportClientError(error, 'error-boundary');
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
            loading={retrying}
            loadingPosition="start"
            onClick={() => startRetry(retry)}
          >
            {dictionary.retry}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
