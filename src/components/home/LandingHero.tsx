'use client';

import { Button, Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import HeroBackground from '../common/HeroBackground.tsx';

export default memo(function LandingHero() {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <HeroBackground
      sx={{ borderRadius: 2, overflow: 'hidden', py: { xs: 6, md: 10 } }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3}>
          <Stack spacing={2}>
            <Typography
              variant="h4"
              component="h1"
              align="center"
              color="common.white"
              sx={{ typography: { md: 'h3' } }}
            >
              {dictionary['create map together']}
            </Typography>

            <Typography
              variant="body1"
              component="p"
              align="center"
              color="common.white"
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
              component={Link}
              href={localePath('/discover')}
              sx={{ color: 'common.white', borderColor: 'common.white' }}
            >
              {dictionary.discover}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </HeroBackground>
  );
});
