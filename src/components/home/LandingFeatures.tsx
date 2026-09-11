'use client';

import { AutoStories, Explore, Place } from '@mui/icons-material';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { type ElementType, memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';

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
    <Stack spacing={3} sx={{ py: { xs: 3, md: 5 } }}>
      {FEATURES.map(({ icon: Icon, title, body }) => (
        <Card key={title} elevation={0}>
          <CardContent>
            <Stack spacing={1.5} alignItems="center">
              <Icon color="primary" sx={{ fontSize: '4rem' }} />

              <Typography
                variant="h6"
                component="h2"
                align="center"
                sx={{ typography: { md: 'h5' } }}
              >
                {dictionary[title]}
              </Typography>
            </Stack>

            {/* Left aligned where the heading is centred: these run to several
                lines, and centred Japanese leaves both edges ragged. */}
            <Typography variant="body1" component="p" sx={{ mt: 2 }}>
              {dictionary[body]}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
});
