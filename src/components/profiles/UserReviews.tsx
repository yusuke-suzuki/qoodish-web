import { Reviews } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { memo, useState, useTransition } from 'react';
import type { Review } from '../../../types';
import {
  fetchMoreMyReviews,
  fetchMoreUserReviews
} from '../../actions/reviews';
import useDictionary from '../../hooks/useDictionary';
import LoadingStatus from '../common/LoadingStatus';
import NoContents from '../common/NoContents';
import ReviewGridList from '../reviews/ReviewGridList';

type Props = {
  userId: number;
  initialReviews: Review[];
  isOwnProfile: boolean;
};

export default memo(function UserReviews({
  userId,
  initialReviews,
  isOwnProfile
}: Props) {
  const dictionary = useDictionary();

  const [reviews, setReviews] = useState(initialReviews);
  const [noMoreResults, setNoMoreResults] = useState(initialReviews.length < 1);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    if (noMoreResults || isPending) return;

    const lastReview = reviews[reviews.length - 1];
    if (!lastReview) {
      setNoMoreResults(true);
      return;
    }

    startTransition(async () => {
      const moreReviews = isOwnProfile
        ? await fetchMoreMyReviews(lastReview.created_at)
        : await fetchMoreUserReviews(userId, lastReview.created_at);
      setReviews((prev) => [...prev, ...moreReviews]);
      setNoMoreResults(moreReviews.length < 1);
    });
  };

  return (
    <>
      {reviews.length < 1 && !isPending && (
        <NoContents
          message={dictionary['reports will see here']}
          icon={Reviews}
        />
      )}

      <LoadingStatus loading={isPending} />

      <ReviewGridList reviews={reviews} hideSkeleton loading={isPending} />

      <Stack alignItems="center" sx={{ mt: 2 }}>
        {!isPending && !noMoreResults && reviews.length > 0 && (
          <Button onClick={loadMore} color="secondary">
            {dictionary['load more']}
          </Button>
        )}
      </Stack>
    </>
  );
});
