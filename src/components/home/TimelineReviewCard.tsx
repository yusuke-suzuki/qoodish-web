'use client';

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
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import ProfileBoundary from '../common/ProfileBoundary.tsx';
import LikeReviewButton from '../reviews/LikeReviewButton.tsx';
import ReviewCardHeader from '../reviews/ReviewCardHeader.tsx';
import ReviewImageList from '../reviews/ReviewImageList.tsx';
import ReviewMenuButton from '../reviews/ReviewMenuButton.tsx';

type Props = {
  review: Review;
  onReportClick: (review: Review) => void;
};

export default memo(function TimelineReviewCard({
  review,
  onReportClick
}: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <Card>
      <ReviewCardHeader
        review={review}
        action={
          <ProfileBoundary>
            {(profile) => (
              <ReviewMenuButton
                review={review}
                currentProfile={profile}
                onReportClick={onReportClick}
              />
            )}
          </ProfileBoundary>
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
          href={localePath(`/pins/${review.id}`)}
          title={dictionary.comment}
          aria-label={dictionary.comment}
        >
          <Comment />
        </IconButton>
      </CardActions>
    </Card>
  );
});
