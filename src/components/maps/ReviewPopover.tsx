import {
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Popover,
  Typography
} from '@mui/material';
import { memo, useCallback, useContext, useState } from 'react';
import { Review } from '../../../types';
import ReviewCardHeader from '../reviews/ReviewCardHeader';
import ReviewMenuButton from '../reviews/ReviewMenuButton';

import { Comment } from '@mui/icons-material';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import AuthContext from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useReview } from '../../hooks/useReview';
import IssueDialog from '../common/IssueDialog';
import DeleteReviewDialog from '../reviews/DeleteReviewDialog';
import EditReviewDialog from '../reviews/EditReviewDialog';
import LikeReviewButton from '../reviews/LikeReviewButton';

type Props = {
  currentReview: Review | null;
  anchorEl: HTMLButtonElement | null;
  popoverId: string | undefined;
  popoverOpen: boolean;
  onPopoverClose: () => void;
  onDeleted: () => void;
};

function ReviewPopover({
  currentReview,
  anchorEl,
  popoverId,
  popoverOpen,
  onPopoverClose,
  onDeleted
}: Props) {
  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);
  const { review: mutableReview, mutate } = useReview(
    currentReview?.map.id,
    currentReview?.id
  );

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);

  const handleReviewSaved = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleReviewDeleted = useCallback(() => {
    onDeleted();
  }, [onDeleted]);

  const review: Review = mutableReview || currentReview;

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
        <Swiper pagination={true} modules={[Pagination]}>
          {review?.images.map((image) => (
            <SwiperSlide key={image.id}>
              <CardMedia
                component="img"
                alt={review.name}
                image={image.thumbnail_url_400}
                width={1200}
                height={630}
                sx={{
                  height: 168,
                  cursor: 'grab'
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <CardContent sx={{ pt: review?.images.length > 0 ? 2 : 0, pb: 0 }}>
          <Typography variant="h6" gutterBottom>
            {review?.name}
          </Typography>
          <Typography variant="body2" component="p">
            {review?.comment}
          </Typography>
        </CardContent>
        <CardActions>
          {review && (
            <LikeReviewButton review={review} onSaved={handleReviewSaved} />
          )}

          <IconButton
            LinkComponent={Link}
            href={`/maps/${review?.map.id}/reports/${review?.id}`}
            disabled={!review}
          >
            <Comment />
          </IconButton>
        </CardActions>
      </Popover>

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

export default memo(ReviewPopover);
