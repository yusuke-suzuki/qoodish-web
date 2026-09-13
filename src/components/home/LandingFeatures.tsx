'use client';

import { AutoStories, Explore, Place } from '@mui/icons-material';
import {
  Box,
  Container,
  Divider,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import { type ElementType, Fragment, memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import { PHOTOS, type Photo } from '../../utils/photos.ts';
import LandingSection from './LandingSection.tsx';

type Feature = {
  icon: ElementType;
  title: string;
  body: string;
  photo: Photo;
};

const FEATURES: Feature[] = [
  {
    icon: Place,
    title: 'share favorite spot',
    body: 'tell friends spot',
    photo: PHOTOS.drinkAtTheLookout
  },
  {
    icon: Explore,
    title: 'find your best place',
    body: 'surely your friends know',
    photo: PHOTOS.stationConcourse
  },
  {
    icon: AutoStories,
    title: 'everyone has a journal',
    body: 'journey to journal',
    photo: PHOTOS.islandCliffs
  }
];

export default memo(function LandingFeatures() {
  const dictionary = useDictionary();

  return (
    <>
      {FEATURES.map(({ icon: Icon, title, body, photo }, index) => (
        <Fragment key={title}>
          {index > 0 && (
            <Container maxWidth="lg">
              <Divider />
            </Container>
          )}

          <LandingSection>
            <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={3} alignItems="flex-start">
                  {/* Larger than the heading's own size: an icon's glyph sits
                      inset in its box, so matching sizes reads smaller. */}
                  <Icon color="primary" sx={{ fontSize: { xs: 48, sm: 72 } }} />

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
                    sx={{ fontSize: { md: '1.125rem' }, opacity: 0.7 }}
                  >
                    {dictionary[body]}
                  </Typography>
                </Stack>
              </Grid>

              {/* Ordered rather than reversed, so that stacked on a phone the
                  sentence still comes before its photograph. */}
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ order: { md: index % 2 === 1 ? -1 : 0 } }}
              >
                <Box
                  component="img"
                  src={photo.src}
                  srcSet={photo.srcSet}
                  sizes="(min-width: 900px) 50vw, 100vw"
                  alt=""
                  loading="lazy"
                  sx={{
                    display: 'block',
                    width: '100%',
                    aspectRatio: '4 / 3',
                    objectFit: 'cover',
                    borderRadius: 1,
                    // Holds the band's shape while the photograph is on its way.
                    bgcolor: 'action.hover'
                  }}
                />
              </Grid>
            </Grid>
          </LandingSection>
        </Fragment>
      ))}
    </>
  );
});
