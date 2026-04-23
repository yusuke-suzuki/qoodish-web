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
import ProfileContext from '../../context/ProfileContext';
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
  const profile = useContext(ProfileContext);

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleReviewDeleted = useCallback(() => {
    onClose();
    onDeleted();
  }, [onClose, onDeleted]);

  const review = currentReview;

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        variant="temporary"
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        disableSwipeToOpen
        sx={{ zIndex: (theme) => theme.zIndex.appBar - 1 }}
        ModalProps={{
          slotProps: {
            backdrop: {
              invisible: true
            }
          }
        }}
        slotProps={{
          transition: {
            onExited
          }
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
        onSaved={onSaved}
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
