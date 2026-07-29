import { Reviews } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import { memo, useCallback, useState, useTransition } from 'react';
import type { Review } from '../../../types';
import {
  fetchMoreMyReviews,
  fetchMoreUserReviews
} from '../../actions/reviews';
import useDictionary from '../../hooks/useDictionary';
import FootprintsLoader from '../common/FootprintsLoader';
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

  const loadMore = useCallback(() => {
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
  }, [userId, isOwnProfile, reviews, noMoreResults, isPending]);

  return (
    <>
      {reviews.length < 1 && !isPending && (
        <NoContents
          message={dictionary['reports will see here']}
          icon={Reviews}
        />
      )}

      <Box sx={{ display: 'grid', gap: 1 }}>
        {reviews.length > 0 && (
          <ReviewGridList reviews={reviews} hideSkeleton />
        )}
      </Box>

      {isPending && (
        <Box sx={{ my: 2, height: { xs: 220, sm: 280 } }}>
          <FootprintsLoader label={dictionary.loading} />
        </Box>
      )}

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
