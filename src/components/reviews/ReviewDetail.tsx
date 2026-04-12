'use client';

import { KeyboardArrowLeft } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import type { Review } from '../../../types';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import { useProfile } from '../../hooks/useProfile';
import IssueDialog from '../common/IssueDialog';
import DeleteReviewDialog from './DeleteReviewDialog';
import EditReviewDialog from './EditReviewDialog';
import ReviewCardActions from './ReviewCardActions';
import ReviewCardHeader from './ReviewCardHeader';
import ReviewComments from './ReviewComments';
import ReviewImageList from './ReviewImageList';
import ReviewMenuButton from './ReviewMenuButton';

type Props = {
  review: Review;
};

export default function ReviewDetail({ review }: Props) {
  const dictionary = useDictionary();

  const { lang, mapId } = useParams<{
    lang: string;
    mapId: string;
  }>();
  const router = useRouter();

  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card elevation={0}>
        <ReviewCardHeader
          review={review}
          action={
            <ReviewMenuButton
              review={review}
              currentProfile={profile}
              onReportClick={() => setIssueDialogOpen(true)}
              onEditClick={() => setEditDialogOpen(true)}
              onDeleteClick={() => setDeleteDialogOpen(true)}
              hideDetail
            />
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
          href={`/${lang}/maps/${mapId}`}
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

      <IssueDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        contentType="review"
        contentId={review.id}
      />
    </>
  );
}
