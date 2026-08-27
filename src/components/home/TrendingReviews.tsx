'use client';

import { Reviews } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Review } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import NoContents from '../common/NoContents.tsx';
import TimelineReviewCard from './TimelineReviewCard.tsx';

type Props = {
  reviews: Review[];
};

export default memo(function TrendingReviews({ reviews }: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <>
      <Typography
        variant="h6"
        component="h1"
        color="text.secondary"
        gutterBottom
      >
        {dictionary['trending reviews']}
      </Typography>

      {reviews.length < 1 && (
        <NoContents
          message={dictionary['reports will see here']}
          icon={Reviews}
        />
      )}

      <Box sx={{ display: 'grid', gap: 3 }}>
        {reviews.map((review) => (
          <TimelineReviewCard key={review.id} review={review} />
        ))}
      </Box>

      <Stack alignItems="center" sx={{ mt: 2 }}>
        <Link href={localePath('/discover')} passHref>
          <Button color="secondary">{dictionary['discover more']}</Button>
        </Link>
      </Stack>
    </>
  );
});
