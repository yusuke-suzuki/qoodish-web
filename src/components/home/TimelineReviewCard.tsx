import { Comment } from '@mui/icons-material';
import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Review } from '../../../types';
import LikeReviewButton from '../reviews/LikeReviewButton';
import ReviewCardHeader from '../reviews/ReviewCardHeader';
import ReviewImageList from '../reviews/ReviewImageList';
import ReviewMenuButton from '../reviews/ReviewMenuButton';

type Props = {
  review: Review;
  onReportClick?: (review: Review) => void;
};

export default memo(function TimelineReviewCard({
  review,
  onReportClick
}: Props) {
  return (
    <Card elevation={0}>
      <ReviewCardHeader
        review={review}
        action={
          <ReviewMenuButton review={review} onReportClick={onReportClick} />
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {review.name}
        </Typography>

        <Typography component="p" gutterBottom>
          {review.comment}
        </Typography>

        {review.images.length > 0 && <ReviewImageList review={review} />}
      </CardContent>
      <CardActions>
        <LikeReviewButton review={review} />

        <IconButton
          LinkComponent={Link}
          href={`/maps/${review.map.id}/reports/${review.id}`}
        >
          <Comment />
        </IconButton>
      </CardActions>
    </Card>
  );
});
