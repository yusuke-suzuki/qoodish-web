import { Comment, Flag, OutlinedFlag } from '@mui/icons-material';
import {
  Box,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  IconButton,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo, useCallback, useContext, useState } from 'react';
import type { Review } from '../../../types';
import ProfileContext from '../../context/ProfileContext';
import useDictionary from '../../hooks/useDictionary';
import useLocalePath from '../../hooks/useLocalePath';
import BottomSheet from '../common/BottomSheet';
import IssueDialog from '../common/IssueDialog';
import DeleteReviewDialog from '../reviews/DeleteReviewDialog';
import EditReviewDialog from '../reviews/EditReviewDialog';
import LikeReviewButton from '../reviews/LikeReviewButton';
import ReviewCardHeader from '../reviews/ReviewCardHeader';
import ReviewMenuButton from '../reviews/ReviewMenuButton';

type MilestoneAction = {
  selected: boolean;
  onAdd: () => void | Promise<void>;
};

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onExited: () => void;
  currentReview: Review | null;
  milestoneAction?: MilestoneAction | null;
  onSaved: () => void;
  onDeleted: () => void;
};

function ReviewDrawer({
  open,
  onOpen,
  onClose,
  onExited,
  currentReview,
  milestoneAction,
  onSaved,
  onDeleted
}: Props) {
  const profile = useContext(ProfileContext);
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [milestoneLoading, setMilestoneLoading] = useState(false);

  const handleReviewDeleted = useCallback(() => {
    onClose();
    onDeleted();
  }, [onClose, onDeleted]);

  const handleAddMilestone = useCallback(async () => {
    if (!milestoneAction) {
      return;
    }

    setMilestoneLoading(true);

    try {
      await milestoneAction.onAdd();
    } finally {
      setMilestoneLoading(false);
    }
  }, [milestoneAction]);

  const review = currentReview;

  return (
    <>
      <BottomSheet
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        onExited={onExited}
        invisibleBackdrop
        sx={{
          zIndex: (theme) => theme.zIndex.appBar - 1,
          display: { xs: 'block', md: 'none' }
        }}
      >
        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
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
              <Box
                key={image.id}
                sx={{
                  flexShrink: 0,
                  width: 200,
                  height: 200,
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <CardMedia
                  component="img"
                  alt={review.name}
                  image={image.card}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            ))}
          </CardContent>
        </Box>

        <CardActions
          sx={{
            flexShrink: 0,
            justifyContent: 'space-between',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          {review && milestoneAction && (
            <Chip
              clickable
              color="default"
              disabled={milestoneAction.selected || milestoneLoading}
              onClick={handleAddMilestone}
              icon={
                milestoneLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : milestoneAction.selected ? (
                  <Flag />
                ) : (
                  <OutlinedFlag />
                )
              }
              label={
                milestoneAction.selected
                  ? dictionary['milestone added']
                  : dictionary['add milestone']
              }
            />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {review && <LikeReviewButton review={review} />}

            {review && (
              <IconButton
                LinkComponent={Link}
                href={localePath(
                  `/maps/${review?.map.id}/reports/${review?.id}`
                )}
                disabled={!review}
              >
                <Comment />
              </IconButton>
            )}
          </Box>
        </CardActions>
      </BottomSheet>
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
