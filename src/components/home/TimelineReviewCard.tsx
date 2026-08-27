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
import type { Review } from '../../../types/index.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import LikeReviewButton from '../reviews/LikeReviewButton.tsx';
import ReviewCardHeader from '../reviews/ReviewCardHeader.tsx';
import ReviewImageList from '../reviews/ReviewImageList.tsx';
import ReviewMenuButton from '../reviews/ReviewMenuButton.tsx';

type Props = {
  review: Review;
  onReportClick?: (review: Review) => void;
};

export default memo(function TimelineReviewCard({
  review,
  onReportClick
}: Props) {
  const localePath = useLocalePath();

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
          href={localePath(`/maps/${review.map.id}/reports/${review.id}`)}
        >
          <Comment />
        </IconButton>
      </CardActions>
    </Card>
  );
});
