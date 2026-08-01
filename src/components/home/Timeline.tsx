'use client';

import { Reviews } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import { memo, useCallback, useState, useTransition } from 'react';
import type { Review } from '../../../types';
import { fetchMoreTimelineReviews } from '../../actions/reviews';
import useDictionary from '../../hooks/useDictionary';
import IssueDialog from '../common/IssueDialog';
import LoadingStatus from '../common/LoadingStatus';
import NoContents from '../common/NoContents';
import TimelineReviewCard from './TimelineReviewCard';
import TimelineReviewCardSkeleton from './TimelineReviewCardSkeleton';

type Props = {
  initialReviews: Review[];
};

type IssueReportOptions = {
  contentId: number | null;
  dialogOpen: boolean;
};

const skeletonKeys = ['skeleton-1', 'skeleton-2'];

export default memo(function Timeline({ initialReviews }: Props) {
  const dictionary = useDictionary();

  const [reviews, setReviews] = useState(initialReviews);
  const [noMoreResults, setNoMoreResults] = useState(initialReviews.length < 1);
  const [isPending, startTransition] = useTransition();

  const [issueReportOptions, setIssueReportOptions] =
    useState<IssueReportOptions>({
      contentId: null,
      dialogOpen: false
    });

  const loadMore = useCallback(() => {
    if (noMoreResults || isPending) return;

    const lastReview = reviews[reviews.length - 1];
    if (!lastReview) {
      setNoMoreResults(true);
      return;
    }

    startTransition(async () => {
      const moreReviews = await fetchMoreTimelineReviews(lastReview.created_at);
      setReviews((prev) => [...prev, ...moreReviews]);
      setNoMoreResults(moreReviews.length < 1);
    });
  }, [reviews, noMoreResults, isPending]);

  const handleReportClick = useCallback((review: Review) => {
    setIssueReportOptions({
      contentId: review.id,
      dialogOpen: true
    });
  }, []);

  const handleIssueDialogClose = useCallback(() => {
    setIssueReportOptions({
      contentId: null,
      dialogOpen: false
    });
  }, []);

  return (
    <>
      {reviews.length < 1 && !isPending && (
        <NoContents
          message={dictionary['reports will see here']}
          icon={Reviews}
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

      <IssueDialog
        open={issueReportOptions.dialogOpen}
        onClose={handleIssueDialogClose}
        contentType="review"
        contentId={issueReportOptions.contentId}
      />
    </>
  );
});
