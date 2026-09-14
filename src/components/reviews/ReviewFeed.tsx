'use client';

import { Reviews } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { memo, useState, useTransition } from 'react';
import type { Review } from '../../../types/index.ts';
import { fetchMoreReviewFeed } from '../../actions/reviews.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import LoadingStatus from '../common/LoadingStatus.tsx';
import NoContents from '../common/NoContents.tsx';
import ReviewGridList from './ReviewGridList.tsx';

type Props = {
  initialReviews: Review[];
};

export default memo(function ReviewFeed({ initialReviews }: Props) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();

  const [reviews, setReviews] = useState(initialReviews);
  const [noMoreResults, setNoMoreResults] = useState(initialReviews.length < 1);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    const lastReview = reviews[reviews.length - 1];

    if (noMoreResults || isPending || !lastReview) {
      return;
    }

    startTransition(async () => {
      try {
        const moreReviews = await fetchMoreReviewFeed(
          lang,
          lastReview.created_at,
          lastReview.id
        );
        setReviews((prev) => [...prev, ...moreReviews]);
        setNoMoreResults(moreReviews.length < 1);
      } catch {
        enqueueSnackbar(dictionary['load more failed'], { variant: 'error' });
      }
    });
  };

  if (reviews.length < 1) {
    return <NoContents icon={Reviews} message={dictionary['no reports yet']} />;
  }

  return (
    <>
      <LoadingStatus loading={isPending} />

      <ReviewGridList reviews={reviews} loading={isPending} />

      <Stack alignItems="center" sx={{ mt: 2 }}>
        {!isPending && !noMoreResults && (
          <Button onClick={loadMore} color="secondary">
            {dictionary['load more']}
          </Button>
        )}
      </Stack>
    </>
  );
});
