'use client';

import { PhotoLibrary, Place } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Review } from '../../../types/index.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import MediaPlaceholder from '../common/MediaPlaceholder.tsx';
import TypeMark, { TYPE_TITLE } from '../common/TypeMark.tsx';

type Props = {
  review: Review;
};

export default memo(function ReviewCard({ review }: Props) {
  const localePath = useLocalePath();

  const [image] = review.images;

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        component={Link}
        href={localePath(`/maps/${review.map.id}/reports/${review.id}`)}
        sx={{ height: '100%' }}
      >
        <Box sx={{ position: 'relative' }}>
          {image ? (
            <CardMedia
              component="img"
              image={image.card}
              alt={review.name}
              loading="lazy"
              sx={{ aspectRatio: '3 / 2', objectFit: 'cover' }}
            />
          ) : (
            <MediaPlaceholder icon={Place} />
          )}

          {review.images.length > 1 && (
            <PhotoLibrary
              htmlColor="white"
              fontSize="small"
              sx={{ position: 'absolute', top: 8, right: 8 }}
            />
          )}
        </Box>

        <CardContent>
          <Typography variant="h6" component="h3" sx={TYPE_TITLE}>
            <TypeMark icon={Place} />
            {review.name}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {review.author.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ mt: 1 }}
          >
            {review.map.name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});
