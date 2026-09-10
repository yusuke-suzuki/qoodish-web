'use client';

import { Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';

export default memo(function LandingHero() {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <Stack spacing={3} sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={2}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{ typography: { md: 'h3' } }}
        >
          {dictionary['create map together']}
        </Typography>

        <Typography
          variant="body1"
          component="p"
          align="center"
          color="text.secondary"
        >
          {dictionary['meta description']}
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="center"
      >
        <Button
          variant="contained"
          size="large"
          component={Link}
          href={localePath('/login')}
        >
          {dictionary['get started']}
        </Button>

        <Button
          variant="outlined"
          size="large"
          color="secondary"
          component={Link}
          href={localePath('/discover')}
        >
          {dictionary.discover}
        </Button>
      </Stack>
    </Stack>
  );
});
