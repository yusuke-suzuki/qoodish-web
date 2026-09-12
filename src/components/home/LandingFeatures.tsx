'use client';

import { AutoStories, Explore, Place } from '@mui/icons-material';
import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { type ElementType, memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import LandingSection from './LandingSection.tsx';

const FEATURES: { icon: ElementType; title: string; body: string }[] = [
  {
    icon: Place,
    title: 'share favorite spot',
    body: 'tell friends spot'
  },
  {
    icon: Explore,
    title: 'find your best place',
    body: 'surely your friends know'
  },
  {
    icon: AutoStories,
    title: 'everyone has a journal',
    body: 'journey to journal'
  }
];

export default memo(function LandingFeatures() {
  const dictionary = useDictionary();

  return (
    <LandingSection sx={{ bgcolor: '#17130F', color: 'common.white' }}>
      <Grid container spacing={{ xs: 3, md: 4 }}>
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <Grid key={title} size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 6,
                // Paper paints its own ground and text colour, both of which
                // are written for a light page.
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                color: 'inherit'
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={3}>
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <Icon color="primary" sx={{ fontSize: 36 }} />
                  </Box>

                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ typography: { md: 'h4' } }}
                  >
                    {dictionary[title]}
                  </Typography>

                  <Typography
                    variant="body1"
                    component="p"
                    sx={{ opacity: 0.75 }}
                  >
                    {dictionary[body]}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </LandingSection>
  );
});
