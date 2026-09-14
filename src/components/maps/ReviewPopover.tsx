import { Comment } from '@mui/icons-material';
import {
  CardActions,
  CardContent,
  IconButton,
  Popover,
  Typography
} from '@mui/material';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { memo, useState } from 'react';
import type { Review } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import useProfile from '../../hooks/useProfile.ts';
import IssueDialog from '../common/IssueDialog.tsx';
import DeleteReviewDialog from '../reviews/DeleteReviewDialog.tsx';
import EditReviewDialog from '../reviews/EditReviewDialog.tsx';
import LikeReviewButton from '../reviews/LikeReviewButton.tsx';
import ReviewCardHeader from '../reviews/ReviewCardHeader.tsx';
import ReviewMenuButton from '../reviews/ReviewMenuButton.tsx';

// Swiper is only wanted once a pin with photographs is opened, so the map
// page does not carry it in its first load.
const ReviewImageCarousel = dynamic(
  () => import('../reviews/ReviewImageCarousel.tsx'),
  { ssr: false }
);

type Props = {
  currentReview: Review | null;
  anchorEl: HTMLButtonElement | null;
  popoverId: string | undefined;
  popoverOpen: boolean;
  onPopoverClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
};

function ReviewPopover({
  currentReview,
  anchorEl,
  popoverId,
  popoverOpen,
  onPopoverClose,
  onSaved,
  onDeleted
}: Props) {
  const profile = useProfile();
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);

  const review = currentReview;

  return (
    <>
      <Popover
        id={popoverId}
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={onPopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        slotProps={{
          paper: {
            sx: {
              width: 320
            }
          }
        }}
        disableScrollLock
      >
        <ReviewCardHeader
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
        {review && review.images.length > 0 && (
          <ReviewImageCarousel
            images={review.images}
            alt={review.name}
            height={168}
          />
        )}
        <CardContent sx={{ pt: review?.images.length > 0 ? 2 : 0, pb: 0 }}>
          <Typography variant="h6" gutterBottom>
            {review?.name}
          </Typography>
          <Typography variant="body2" component="p">
            {review?.comment}
          </Typography>
        </CardContent>
        <CardActions>
          {review && <LikeReviewButton review={review} onSaved={onSaved} />}

          <IconButton
            LinkComponent={Link}
            href={localePath(`/maps/${review?.map.id}/reports/${review?.id}`)}
            disabled={!review}
            title={dictionary.comment}
            aria-label={dictionary.comment}
          >
            <Comment />
          </IconButton>
        </CardActions>
      </Popover>

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
        onDeleted={onDeleted}
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

export default memo(ReviewPopover);
