'use client';

import { Reviews } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Review } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import NoContents from '../common/NoContents.tsx';
import LandingSection from './LandingSection.tsx';
import TimelineReviewCard from './TimelineReviewCard.tsx';

type Props = {
  reviews: Review[];
};

export default memo(function TrendingReviews({ reviews }: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <LandingSection sx={{ bgcolor: 'background.default' }}>
      <Typography
        variant="h5"
        component="h2"
        sx={{ typography: { md: 'h3' }, mb: { xs: 4, md: 6 } }}
      >
        {dictionary['trending reviews']}
      </Typography>

      {reviews.length < 1 && (
        <NoContents
          message={dictionary['reports will see here']}
          icon={Reviews}
        />
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          // The cards run to different lengths, and stretching them to the
          // tallest of a row leaves the short ones with a well of empty card.
          alignItems: 'start',
          // The card is shared with the timeline, where it sits at the radius
          // the rest of the app uses; on this page it has to match the bands.
          '& > .MuiPaper-root': { borderRadius: 6 }
        }}
      >
        {reviews.map((review) => (
          <TimelineReviewCard key={review.id} review={review} />
        ))}
      </Box>

      <Stack alignItems="center" sx={{ mt: { xs: 5, md: 7 } }}>
        <Button
          component={Link}
          href={localePath('/discover')}
          variant="outlined"
          size="large"
          color="inherit"
          sx={{ borderRadius: 999, px: 4, py: 1.25 }}
        >
          {dictionary['discover more']}
        </Button>
      </Stack>
    </LandingSection>
  );
});
