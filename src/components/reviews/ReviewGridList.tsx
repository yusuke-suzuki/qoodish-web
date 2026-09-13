'use client';

import { Grid, Skeleton } from '@mui/material';
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

const SIZE = { xs: 6, sm: 4, md: 3 };

function ReviewGridList({ reviews, loading }: Props) {
  return (
    <Grid container spacing={2} aria-busy={loading}>
      {reviews.map((review) => (
        <Grid key={review.id} size={SIZE}>
          <ReviewCard review={review} />
        </Grid>
      ))}

      {loading &&
        loadingTileKeys.map((key) => (
          <Grid key={key} size={SIZE}>
            {/* Skeleton keeps a 1.2em height unless it is cleared, which
                would override the aspect ratio. */}
            <Skeleton
              variant="rounded"
              sx={{ height: 'auto', aspectRatio: '1 / 1' }}
            />
          </Grid>
        ))}
    </Grid>
  );
}

export default memo(ReviewGridList);
