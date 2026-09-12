'use client';

import { AutoStories, Explore, Place } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';
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
    <>
      {FEATURES.map(({ icon: Icon, title, body }, index) => {
        const dark = index % 2 === 0;

        return (
          <LandingSection
            key={title}
            sx={
              dark
                ? { bgcolor: '#17130F', color: 'common.white' }
                : { bgcolor: 'background.paper' }
            }
          >
            {/* Held short of the container: a heading this size runs to a
                single word per line once the measure gets long. */}
            <Stack spacing={3} sx={{ maxWidth: 880 }}>
              <Icon color="primary" sx={{ fontSize: 48 }} />

              <Typography
                variant="h4"
                component="h2"
                sx={{ typography: { sm: 'h3' } }}
              >
                {dictionary[title]}
              </Typography>

              <Typography
                variant="body1"
                component="p"
                sx={{ fontSize: { md: '1.125rem' }, opacity: dark ? 0.8 : 0.7 }}
              >
                {dictionary[body]}
              </Typography>
            </Stack>
          </LandingSection>
        );
      })}
    </>
  );
});
