import { Comment, DragHandle } from '@mui/icons-material';
import {
  Box,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  SwipeableDrawer,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo, useCallback, useContext, useState } from 'react';
import type { Review } from '../../../types';
import AuthContext from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useReview } from '../../hooks/useReview';
import IssueDialog from '../common/IssueDialog';
import DeleteReviewDialog from '../reviews/DeleteReviewDialog';
import EditReviewDialog from '../reviews/EditReviewDialog';
import LikeReviewButton from '../reviews/LikeReviewButton';
import ReviewCardHeader from '../reviews/ReviewCardHeader';
import ReviewMenuButton from '../reviews/ReviewMenuButton';

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onExited: () => void;
  currentReview: Review | null;
  onSaved: () => void;
  onDeleted: () => void;
};

function ReviewDrawer({
  open,
  onOpen,
  onClose,
  onExited,
  currentReview,
  onSaved,
  onDeleted
}: Props) {
  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);
  const { review: mutableReview, mutate } = useReview(
    currentReview?.map.id,
    currentReview?.id
  );

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleReviewSaved = useCallback(() => {
    mutate();
    onSaved();
  }, [mutate, onSaved]);

  const handleReviewDeleted = useCallback(() => {
    onClose();
    onDeleted();
  }, [onClose, onDeleted]);

  const review = mutableReview || currentReview;

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        variant="temporary"
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        disableSwipeToOpen
        ModalProps={{
          slotProps: {
            backdrop: {
              invisible: true
            }
          }
        }}
        SlideProps={{
          onExited
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {<DragHandle fontSize="small" color="disabled" />}
        </Box>

        <CardContent sx={{ pt: 0, pb: 1 }}>
          <Typography variant="h6">{review?.name}</Typography>
        </CardContent>

        <ReviewCardHeader
          sx={{ pt: 0 }}
          review={review}
          hideMapLink
          action={
            <ReviewMenuButton
              review={review}
              currentProfile={profile}
              onReportClick={() => setIssueDialogOpen(true)}
              onEditClick={() => setEditDialogOpen(true)}
              onDeleteClick={() => setDeleteDialogOpen(true)}
            />
          }
        />

        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body2" component="p">
            {review?.comment}
          </Typography>
        </CardContent>

        <CardContent
          sx={{
            display: 'flex',
            gap: 2,
            width: '100%',
            overflowX: 'auto',
            py: 0
          }}
        >
          {review?.images.map((image) => (
            <CardMedia
              key={image.id}
              component="img"
              alt={review.name}
              image={image.thumbnail_url_400}
              width={200}
              height={200}
              sx={{
                height: 200,
                width: 200
              }}
            />
          ))}
        </CardContent>

        <CardActions>
          {review && <LikeReviewButton review={review} />}

          {review && (
            <IconButton
              LinkComponent={Link}
              href={`/maps/${review?.map.id}/reports/${review?.id}`}
              disabled={!review}
            >
              <Comment />
            </IconButton>
          )}
        </CardActions>
      </SwipeableDrawer>

      <EditReviewDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentReview={review}
        onSaved={handleReviewSaved}
      />

      <DeleteReviewDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        review={review}
        onDeleted={handleReviewDeleted}
      />

      <IssueDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        contentType="review"
        contentId={review ? review.id : null}
      />
    </>
  );
}

export default memo(ReviewDrawer);
