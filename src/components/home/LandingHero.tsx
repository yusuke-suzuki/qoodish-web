'use client';

import {
  Box,
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
    <HeroBackground sx={{ minHeight: { md: '88vh' }, py: { xs: 10, md: 14 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            {/* Capped: the column is as wide as the container once it stacks,
                which runs the lines past reading length. */}
            <Stack spacing={4} sx={{ maxWidth: 640 }}>
              <Typography
                variant="h4"
                component="h1"
                color="common.white"
                sx={{ typography: { sm: 'h3', md: 'h2' } }}
              >
                {dictionary['create map together']}
              </Typography>

              <Typography
                variant="body1"
                component="p"
                color="common.white"
                sx={{ maxWidth: 520 }}
              >
                {dictionary['meta description']}
              </Typography>

              {/* Boxed so the button takes its own width instead of stretching
                  to the column. */}
              <Box>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  href={localePath('/discover')}
                  sx={{
                    borderRadius: 999,
                    px: 4,
                    py: 1.25,
                    color: 'common.white',
                    borderColor: 'common.white'
                  }}
                >
                  {dictionary.discover}
                </Button>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            {/* A card rather than the bare buttons: the email field and the
                terms notice need a surface of their own to stay legible on
                the photo. */}
            <Card
              elevation={0}
              sx={{ borderRadius: 6, maxWidth: 440, ml: { md: 'auto' } }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={3}>
                  {/* Not "Sign in": the reader this card is aimed at has no
                      account yet, and the buttons already say what they do. */}
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{ typography: { md: 'h5' } }}
                  >
                    {dictionary['get started']}
                  </Typography>

                  <SignInButtons />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </HeroBackground>
  );
});
