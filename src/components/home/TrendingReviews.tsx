import { Reviews } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary';
import { usePopularReviews } from '../../hooks/usePopularReviews';
import NoContents from '../common/NoContents';
import TimelineReviewCard from './TimelineReviewCard';

export default memo(function TrendingReviews() {
  const dictionary = useDictionary();

  const { reviews, isLoading } = usePopularReviews();

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

      {reviews.length < 1 && !isLoading && (
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

      {isLoading && (
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Stack alignItems="center" sx={{ mt: 2 }}>
        <Link href="/discover" passHref>
          <Button color="secondary">{dictionary['discover more']}</Button>
        </Link>
      </Stack>
    </>
  );
});
