'use client';

import { KeyboardArrowLeft } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Review } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import ProfileBoundary from '../common/ProfileBoundary.tsx';
import ReportDialog from '../common/ReportDialog.tsx';
import DeleteReviewDialog from './DeleteReviewDialog.tsx';
import EditReviewDialog from './EditReviewDialog.tsx';
import ReviewCardActions from './ReviewCardActions.tsx';
import ReviewCardHeader from './ReviewCardHeader.tsx';
import ReviewComments from './ReviewComments.tsx';
import ReviewImageList from './ReviewImageList.tsx';
import ReviewMenuButton from './ReviewMenuButton.tsx';

type Props = {
  review: Review;
};

export default function ReviewDetail({ review }: Props) {
  const dictionary = useDictionary();

  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <ReviewCardHeader
          review={review}
          action={
            <ProfileBoundary>
              {(profile) => (
                <ReviewMenuButton
                  review={review}
                  currentProfile={profile}
                  onReportClick={() => setReportDialogOpen(true)}
                  onEditClick={() => setEditDialogOpen(true)}
                  onDeleteClick={() => setDeleteDialogOpen(true)}
                  hideDetail
                />
              )}
            </ProfileBoundary>
          }
        />
        <CardContent sx={{ py: 0 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {review.name}
          </Typography>

          <Typography component="p" gutterBottom>
            {review.comment}
          </Typography>

          {review.images.length > 0 && <ReviewImageList review={review} />}
        </CardContent>
        <ReviewCardActions review={review} onCommentAdded={router.refresh} />

        {review.comments.length > 0 && (
          <CardContent>
            <ReviewComments
              comments={review.comments}
              onDeleted={router.refresh}
            />
          </CardContent>
        )}
        <div />
      </Card>

      <Box sx={{ mt: 2 }}>
        <Button
          color="secondary"
          startIcon={<KeyboardArrowLeft />}
          LinkComponent={Link}
          href={`/${lang}/maps/${review.map.id}`}
        >
          {dictionary['back to map']}
        </Button>
      </Box>

      <EditReviewDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentReview={review}
        onSaved={router.refresh}
      />

      <DeleteReviewDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        review={review}
        onDeleted={router.refresh}
      />

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        moderatableType="Review"
        moderatableId={review.id}
      />
    </>
  );
}
