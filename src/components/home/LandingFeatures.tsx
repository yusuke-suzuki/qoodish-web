'use client';

import { AutoStories, Explore, Place } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { type ElementType, memo } from 'react';
import type { AppMap } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import LandingMapCarousel from './LandingMapCarousel.tsx';
import LandingSection from './LandingSection.tsx';

type MapList = 'active' | 'popular' | 'recent';

// Each band carries the list its own sentence is about: the one about writing
// shows the maps being written in, the one about setting out shows what other
// readers are walking, and the one about the journal shows the maps just begun.
const FEATURES: {
  icon: ElementType;
  title: string;
  body: string;
  list: MapList;
  listLabel: string;
}[] = [
  {
    icon: Place,
    title: 'share favorite spot',
    body: 'tell friends spot',
    list: 'active',
    listLabel: 'active maps'
  },
  {
    icon: Explore,
    title: 'find your best place',
    body: 'surely your friends know',
    list: 'popular',
    listLabel: 'trending maps'
  },
  {
    icon: AutoStories,
    title: 'everyone has a journal',
    body: 'journey to journal',
    list: 'recent',
    listLabel: 'recent maps'
  }
];

type Props = {
  maps: Record<MapList, AppMap[]>;
};

export default memo(function LandingFeatures({ maps }: Props) {
  const dictionary = useDictionary();

  return (
    <>
      {FEATURES.map(({ icon: Icon, title, body, list, listLabel }, index) => {
        const dark = index % 2 === 0;
        const sectionMaps = maps[list];

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
                {/* The lists overlap by nature — a popular map can also be a
                    recent one — and without a name the repeat reads as a bug.
                    Kept well under the heading sizes: a list is named, not
                    spoken. */}
                <Typography
                  variant="subtitle2"
                  component="h3"
                  sx={{ mb: 2, opacity: 0.7 }}
                >
                  {dictionary[listLabel]}
                </Typography>

                <LandingMapCarousel
                  maps={sectionMaps}
                  label={dictionary[listLabel]}
                />
              </Box>
            )}
          </LandingSection>
        );
      })}
    </>
  );
});
