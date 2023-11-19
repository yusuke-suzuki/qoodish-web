import {
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Popover,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { memo, useContext } from 'react';
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
import LikeReviewButton from '../reviews/LikeReviewButton';

type Props = {
  currentReview: Review | null;
  anchorEl: HTMLButtonElement | null;
  popoverId: string | undefined;
  popoverOpen: boolean;
  onPopoverClose: () => void;
  onReportClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
};

function ReviewPopover({
  currentReview,
  anchorEl,
  popoverId,
  popoverOpen,
  onPopoverClose,
  onReportClick,
  onEditClick,
  onDeleteClick
}: Props) {
  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);

  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
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
            width: {
              xs: 240,
              md: 320
            }
          }
        }
      }}
      disableScrollLock
    >
      <ReviewCardHeader
        review={currentReview}
        hideMapLink
        action={
          <ReviewMenuButton
            review={currentReview}
            currentProfile={profile}
            onReportClick={onReportClick}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
          />
        }
      />
      <Swiper pagination={true} modules={[Pagination]}>
        {currentReview?.images.map((image) => (
          <SwiperSlide key={image.id}>
            <CardMedia
              component="img"
              alt={currentReview.name}
              image={image.thumbnail_url_400}
              width={1200}
              height={630}
              sx={{
                height: {
                  xs: 126,
                  md: 168
                },
                cursor: 'grab'
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <CardContent sx={{ pt: currentReview?.images.length > 0 ? 2 : 0, pb: 0 }}>
        <Typography variant={mdUp ? 'h6' : 'subtitle1'} gutterBottom>
          {currentReview?.name}
        </Typography>
        <Typography variant="body2" component="p">
          {currentReview?.comment}
        </Typography>
      </CardContent>
      <CardActions>
        <LikeReviewButton review={currentReview} />

        <IconButton
          LinkComponent={Link}
          href={`/maps/${currentReview?.map.id}/reports/${currentReview?.id}`}
          disabled={!currentReview}
        >
          <Comment />
        </IconButton>
      </CardActions>
    </Popover>
  );
}

export default memo(ReviewPopover);
