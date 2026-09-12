'use client';

import { AutoStories, Explore, Place } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { type ElementType, memo } from 'react';
import type { AppMap, Chapter } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import ChapterCard from '../chapters/ChapterCard.tsx';
import MapCard from '../maps/MapCard.tsx';
import LandingCarousel from './LandingCarousel.tsx';
import LandingSection from './LandingSection.tsx';

type Feature = {
  icon: ElementType;
  title: string;
  body: string;
  content: 'maps' | 'chapters';
};

const FEATURES: Feature[] = [
  {
    icon: Place,
    title: 'share favorite spot',
    body: 'tell friends spot',
    content: 'maps'
  },
  {
    icon: Explore,
    title: 'find your best place',
    body: 'surely your friends know',
    content: 'maps'
  },
  {
    icon: AutoStories,
    title: 'everyone has a journal',
    body: 'journey to journal',
    content: 'chapters'
  }
];

const MAP_SECTIONS = FEATURES.filter(
  (feature) => feature.content === 'maps'
).length;

type Props = {
  maps: AppMap[];
  chapters: Chapter[];
};

export default memo(function LandingFeatures({ maps, chapters }: Props) {
  const dictionary = useDictionary();

  // Each band that draws maps gets a run of its own. Nothing on the page says
  // which list a rail is drawn from, so the same map under two different
  // sentences would read as a fault rather than as two selections that agree.
  const perSection = Math.ceil(maps.length / MAP_SECTIONS);

  return (
    <>
      {FEATURES.map(({ icon: Icon, title, body, content }, index) => {
        const slot = FEATURES.slice(0, index).filter(
          (feature) => feature.content === 'maps'
        ).length;
        const items =
          content === 'maps'
            ? maps
                .slice(slot * perSection, (slot + 1) * perSection)
                .map((map) => (
                  <li key={map.id}>
                    <MapCard map={map} />
                  </li>
                ))
            : chapters.map((chapter) => (
                <li key={chapter.id}>
                  <ChapterCard chapter={chapter} />
                </li>
              ));

        return (
          <LandingSection key={title}>
            <Stack spacing={3}>
              {/* Sized against the heading under it rather than in its own
                  right: an icon's glyph sits inset in its box, so one set to
                  the heading's own size reads smaller than the words do. */}
              <Icon color="primary" sx={{ fontSize: { xs: 48, sm: 72 } }} />

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
                  opacity: 0.7
                }}
              >
                {dictionary[body]}
              </Typography>
            </Stack>

            {items.length > 0 && (
              <Box sx={{ mt: { xs: 5, md: 7 } }}>
                {/* Named after the sentence it sits under: the rail prints no
                    heading of its own, and a scrollable region still has to
                    answer to someone who cannot see where it is. */}
                <LandingCarousel label={dictionary[title]}>
                  {items}
                </LandingCarousel>
              </Box>
            )}
          </LandingSection>
        );
      })}
    </>
  );
});
