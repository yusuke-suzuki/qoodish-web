import { Reviews } from '@mui/icons-material';
import { Box, Button, CircularProgress, Stack } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import { Review } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import { useReviewsInfinite } from '../../hooks/useReviewsInfinite';
import IssueDialog from '../common/IssueDialog';
import NoContents from '../common/NoContents';
import TimelineReviewCard from './TimelineReviewCard';

type IssueReportOptions = {
  contentId: number | null;
  dialogOpen: boolean;
};

export default memo(function Timeline() {
  const dictionary = useDictionary();

  const { data, size, setSize, noMoreResults, isLoadingMore, isEmpty } =
    useReviewsInfinite();

  const [issueReportOptions, setIssueReportOptions] =
    useState<IssueReportOptions>({
      contentId: null,
      dialogOpen: false
    });

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
      {isEmpty && !isLoadingMore && (
        <NoContents
          message={dictionary['reports will see here']}
          icon={Reviews}
        />
      )}

      <Box sx={{ display: 'grid', gap: 3 }}>
        {data.map((reviews, index) => (
          <Box key={index} sx={{ display: 'grid', gap: 3 }}>
            {reviews.map((review) => (
              <TimelineReviewCard
                key={review.id}
                review={review}
                onReportClick={handleReportClick}
              />
            ))}
          </Box>
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
          >
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
