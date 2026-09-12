'use client';

import { Box, Skeleton } from '@mui/material';
import { memo } from 'react';
import type { Review } from '../../../types/index.ts';
import ReviewCard from './ReviewCard.tsx';

type Props = {
  reviews: Review[];
  loading?: boolean;
};

const loadingTileKeys = [
  'loading-1',
  'loading-2',
  'loading-3',
  'loading-4',
  'loading-5',
  'loading-6'
];

// Above a phone the columns follow the width the grid is actually given, so the
// same list works in the main column and in a narrower one. A phone is narrower
// than one of those columns, and a single column of cards makes a browsing page
// as long to scroll as the rails on the landing were meant to avoid.
const gridTemplateColumns = {
  xs: 'repeat(2, 1fr)',
  sm: 'repeat(auto-fill, minmax(240px, 1fr))'
};

function ReviewGridList({ reviews, loading }: Props) {
  return (
    <Box
      sx={{ display: 'grid', gap: 2, gridTemplateColumns }}
      aria-busy={loading}
    >
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {loading &&
        loadingTileKeys.map((key) => (
          <Skeleton key={key} variant="rounded" sx={{ aspectRatio: '3 / 2' }} />
        ))}
    </Box>
  );
}

export default memo(ReviewGridList);
