'use client';

import { Reviews } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { memo, useState, useTransition } from 'react';
import type { Review } from '../../../types/index.ts';
import { fetchMoreTimelineReviews } from '../../actions/reviews.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import CreateMapButton from '../common/CreateMapButton.tsx';
import DiscoverButton from '../common/DiscoverButton.tsx';
import LoadingStatus from '../common/LoadingStatus.tsx';
import NoContents from '../common/NoContents.tsx';
import ReportDialog from '../common/ReportDialog.tsx';
import TimelineReviewCard from './TimelineReviewCard.tsx';
import TimelineReviewCardSkeleton from './TimelineReviewCardSkeleton.tsx';

type Props = {
  initialReviews: Review[];
};

type ReportTarget = {
  reviewId: number | null;
  dialogOpen: boolean;
};

const skeletonKeys = ['skeleton-1', 'skeleton-2'];

export default memo(function Timeline({ initialReviews }: Props) {
  const dictionary = useDictionary();

  const [reviews, setReviews] = useState(initialReviews);
  const [noMoreResults, setNoMoreResults] = useState(initialReviews.length < 1);
  const [isPending, startTransition] = useTransition();

  const [reportTarget, setReportTarget] = useState<ReportTarget>({
    reviewId: null,
    dialogOpen: false
  });

  const loadMore = () => {
    if (noMoreResults || isPending) return;

    const lastReview = reviews[reviews.length - 1];
    if (!lastReview) {
      setNoMoreResults(true);
      return;
    }

    startTransition(async () => {
      try {
        const moreReviews = await fetchMoreTimelineReviews(
          lastReview.created_at
        );
        setReviews((prev) => [...prev, ...moreReviews]);
        setNoMoreResults(moreReviews.length < 1);
      } catch {
        enqueueSnackbar(dictionary['load more failed'], { variant: 'error' });
      }
    });
  };

  const handleReportClick = (review: Review) => {
    setReportTarget({
      reviewId: review.id,
      dialogOpen: true
    });
  };

  const handleReportDialogClose = () => {
    setReportTarget({
      reviewId: null,
      dialogOpen: false
    });
  };

  return (
    <>
      {reviews.length < 1 && !isPending && (
        <NoContents
          message={dictionary['empty timeline']}
          icon={Reviews}
          action={
            <>
              <DiscoverButton />
              <CreateMapButton />
            </>
          }
        />
      )}

      <LoadingStatus loading={isPending} />

      <Box sx={{ display: 'grid', gap: 3 }} aria-busy={isPending}>
        {reviews.map((review) => (
          <TimelineReviewCard
            key={review.id}
            review={review}
            onReportClick={handleReportClick}
          />
        ))}

        {isPending &&
          skeletonKeys.map((key) => <TimelineReviewCardSkeleton key={key} />)}
      </Box>

      <Stack alignItems="center" sx={{ mt: 2 }}>
        {!isPending && !noMoreResults && reviews.length > 0 && (
          <Button onClick={loadMore} color="secondary">
            {dictionary['load more']}
          </Button>
        )}
      </Stack>

      <ReportDialog
        open={reportTarget.dialogOpen}
        onClose={handleReportDialogClose}
        moderatableType="Review"
        moderatableId={reportTarget.reviewId}
      />
    </>
  );
});
