import { Reviews } from '@mui/icons-material';
import { Box, Button, CircularProgress, Stack } from '@mui/material';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary';
import { useUserReviewsInfinite } from '../../hooks/useUserReviewsInfinite';
import NoContents from '../common/NoContents';
import ReviewGridList from '../reviews/ReviewGridList';

type Props = {
  id: number | null;
};

export default memo(function UserReviews({ id }: Props) {
  const { data, size, setSize, noMoreResults, isLoadingMore, isEmpty } =
    useUserReviewsInfinite(id);

  const dictionary = useDictionary();

  return (
    <>
      {isEmpty && !isLoadingMore && (
        <NoContents
          message={dictionary['reports will see here']}
          icon={Reviews}
        />
      )}

      <Box sx={{ display: 'grid', gap: 1 }}>
        {data.map((reviews, index) => (
          <ReviewGridList key={index} reviews={reviews} hideSkeleton />
        ))}
      </Box>

      {isLoadingMore && (
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            my: 2
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Stack alignItems="center" sx={{ mt: 2 }}>
        {!isLoadingMore && !noMoreResults && size > 0 && (
          <Button
            onClick={() => setSize((currentState) => currentState + 1)}
            color="secondary"
            disabled={noMoreResults}
          >
            {dictionary['load more']}
          </Button>
        )}
      </Stack>
    </>
  );
});
