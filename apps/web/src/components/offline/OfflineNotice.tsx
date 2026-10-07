'use client';

import { Refresh } from '@mui/icons-material';
import { Alert, AlertTitle, Button, Container, Stack } from '@mui/material';
import { useEffect } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';

const reload = () => window.location.reload();

export default function OfflineNotice() {
  const dictionary = useDictionary();

  useEffect(() => {
    window.addEventListener('online', reload);

    return () => window.removeEventListener('online', reload);
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Alert severity="warning" sx={{ alignSelf: 'stretch' }}>
          <AlertTitle>{dictionary.offline}</AlertTitle>
          {dictionary['offline description']}
        </Alert>
        <Button color="primary" startIcon={<Refresh />} onClick={reload}>
          {dictionary.retry}
        </Button>
      </Stack>
    </Container>
  );
}
