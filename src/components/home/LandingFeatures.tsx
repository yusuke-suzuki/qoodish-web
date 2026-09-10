'use client';

import { AutoStories, Explore, Place } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';
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
    <Stack spacing={6} sx={{ py: { xs: 3, md: 5 } }}>
      {FEATURES.map(({ icon: Icon, title, body }) => (
        <Stack key={title} alignItems="center" spacing={1.5}>
          <Icon color="primary" sx={{ fontSize: '4rem' }} />

          <Typography
            variant="h6"
            component="h2"
            align="center"
            sx={{ typography: { md: 'h5' } }}
          >
            {dictionary[title]}
          </Typography>

          <Typography variant="body1" component="p" align="center">
            {dictionary[body]}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
});
