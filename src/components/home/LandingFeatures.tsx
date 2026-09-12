'use client';

import { AutoStories, Explore, Place } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { type ElementType, memo } from 'react';
import type { AppMap } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import LandingMapCarousel from './LandingMapCarousel.tsx';
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

type Props = {
  maps: AppMap[];
};

export default memo(function LandingFeatures({ maps }: Props) {
  const dictionary = useDictionary();

  // Each band gets a run of its own. Nothing on the page says which list a rail
  // is drawn from, so the same map under two different sentences would read as
  // a fault rather than as two selections that happen to agree.
  const perSection = Math.ceil(maps.length / FEATURES.length);

  return (
    <>
      {FEATURES.map(({ icon: Icon, title, body }, index) => {
        const dark = index % 2 === 0;
        const sectionMaps = maps.slice(
          index * perSection,
          (index + 1) * perSection
        );

        return (
          <LandingSection
            key={title}
            sx={
              dark
                ? { bgcolor: '#17130F', color: 'common.white' }
                : { bgcolor: 'background.paper' }
            }
          >
            <Stack spacing={3}>
              <Icon color="primary" sx={{ fontSize: 48 }} />

              <Typography
                variant="h4"
                component="h2"
                sx={{ typography: { sm: 'h3' } }}
              >
                {dictionary[title]}
              </Typography>

              {/* Held to a reading measure while the heading spans the band:
                  across the full container these paragraphs run past the line
                  length an eye can track back from. */}
              <Typography
                variant="body1"
                component="p"
                sx={{
                  maxWidth: 640,
                  fontSize: { md: '1.125rem' },
                  opacity: dark ? 0.8 : 0.7
                }}
              >
                {dictionary[body]}
              </Typography>
            </Stack>

            {sectionMaps.length > 0 && (
              <Box sx={{ mt: { xs: 5, md: 7 } }}>
                {/* Named after the sentence it sits under: the rail prints no
                    heading of its own, and a scrollable region still has to
                    answer to someone who cannot see where it is. */}
                <LandingMapCarousel
                  maps={sectionMaps}
                  label={dictionary[title]}
                />
              </Box>
            )}
          </LandingSection>
        );
      })}
    </>
  );
});
