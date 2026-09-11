'use client';

import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import SignInButtons from '../auth/SignInButtons.tsx';
import HeroBackground from '../common/HeroBackground.tsx';

export default memo(function LandingHero() {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <HeroBackground sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            {/* Capped and centred: stacked below md the column is as wide as
                the container, which runs the lines past reading length. */}
            <Stack spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
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
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3} sx={{ maxWidth: 480, mx: 'auto' }}>
              {/* A card rather than the bare buttons: the email field and the
                  terms notice need a surface of their own to stay legible on
                  the photo. */}
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    {/* Not "Sign in": the reader this card is aimed at has no
                        account yet, and the buttons already say what they do. */}
                    <Typography
                      variant="h6"
                      component="h2"
                      align="center"
                      sx={{ typography: { md: 'h5' } }}
                    >
                      {dictionary['get started']}
                    </Typography>

                    <SignInButtons />
                  </Stack>
                </CardContent>
              </Card>

              <Stack alignItems="center">
                <Button
                  variant="outlined"
                  component={Link}
                  href={localePath('/discover')}
                  sx={{ color: 'common.white', borderColor: 'common.white' }}
                >
                  {dictionary.discover}
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </HeroBackground>
  );
});
