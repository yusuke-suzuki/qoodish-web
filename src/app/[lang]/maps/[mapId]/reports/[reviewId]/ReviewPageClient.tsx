'use client';

import { KeyboardArrowLeft } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import type { AppMap, Review } from '../../../../../../../types';
import Layout from '../../../../../../components/Layout';
import IssueDialog from '../../../../../../components/common/IssueDialog';
import Sidebar from '../../../../../../components/layouts/Sidebar';
import DeleteReviewDialog from '../../../../../../components/reviews/DeleteReviewDialog';
import EditReviewDialog from '../../../../../../components/reviews/EditReviewDialog';
import ReviewCardActions from '../../../../../../components/reviews/ReviewCardActions';
import ReviewCardHeader from '../../../../../../components/reviews/ReviewCardHeader';
import ReviewComments from '../../../../../../components/reviews/ReviewComments';
import ReviewImageList from '../../../../../../components/reviews/ReviewImageList';
import ReviewMenuButton from '../../../../../../components/reviews/ReviewMenuButton';
import AuthContext from '../../../../../../context/AuthContext';
import useDictionary from '../../../../../../hooks/useDictionary';
import { useProfile } from '../../../../../../hooks/useProfile';
import { useReview } from '../../../../../../hooks/useReview';

type Props = {
  initialReview: Review | null;
  popularMaps: AppMap[];
};

export default function ReviewPageClient({
  initialReview,
  popularMaps
}: Props) {
  const dictionary = useDictionary();

  const { lang, mapId, reviewId } = useParams<{
    lang: string;
    mapId: string;
    reviewId: string;
  }>();
  const router = useRouter();

  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);

  const {
    review: clientReview,
    isLoading,
    mutate
  } = useReview(Number(mapId), Number(reviewId));

  const review = clientReview || initialReview;

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!review && !isLoading) {
    return (
      <Layout hideBottomNav sidebar={<Sidebar popularMaps={popularMaps} />}>
        <Alert severity="warning">
          <AlertTitle>{dictionary['page not found']}</AlertTitle>
          {dictionary['page not found description']}
        </Alert>
        <Link href={`/${lang}/discover`} passHref>
          <Button color="primary" startIcon={<KeyboardArrowLeft />}>
            {dictionary['back to our site']}
          </Button>
        </Link>
      </Layout>
    );
  }

  return (
    <Layout hideBottomNav sidebar={<Sidebar popularMaps={popularMaps} />}>
      {isLoading ? (
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            my: 2
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
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
            <ReviewCardActions review={review} onCommentAdded={mutate} />

            {review.comments.length > 0 && (
              <CardContent>
                <ReviewComments comments={review.comments} onDeleted={mutate} />
              </CardContent>
            )}
            <div />
          </Card>

          <Box sx={{ mt: 2 }}>
            {review && (
              <Button
                color="secondary"
                startIcon={<KeyboardArrowLeft />}
                LinkComponent={Link}
                href={`/${lang}/maps/${mapId}`}
              >
                {dictionary['back to map']}
              </Button>
            )}
          </Box>
        </>
      )}

      <EditReviewDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentReview={review}
        onSaved={mutate}
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
        contentId={review ? review.id : null}
      />
    </Layout>
  );
}
