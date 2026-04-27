'use client';

import { PhotoLibrary, Place } from '@mui/icons-material';
import {
  Box,
  ButtonBase,
  Card,
  CardMedia,
  ImageListItemBar,
  Link as MuiLink,
  Paper,
  Skeleton
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Review } from '../../../types';

type Props = {
  reviews: Review[];
  hideSkeleton?: boolean;
};

const tileImageHeight = 180;

function ReviewGridList({ reviews, hideSkeleton }: Props) {
  if (reviews.length < 1 && hideSkeleton) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1,
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)'
        }
      }}
    >
      {(!reviews.length ? Array.from(new Array(6)) : reviews).map(
        (review: Review | null, i) => (
          <MuiLink
            href={review ? `/maps/${review.map.id}/reports/${review.id}` : '/'}
            key={review ? review.id : i}
            underline={review ? 'hover' : 'none'}
            color="inherit"
            component={Link}
            title={review?.name}
          >
            <Box
              sx={{
                position: 'relative',
                height: tileImageHeight,
                overflow: 'hidden'
              }}
            >
              {!review && <Skeleton variant="rectangular" height="100%" />}

              {review?.images.length > 0 && (
                <Card sx={{ height: '100%' }} elevation={0}>
                  <ButtonBase sx={{ display: 'contents' }}>
                    <CardMedia
                      component="img"
                      image={review.images[0].thumbnail_url_400}
                      height="100%"
                      alt={review.name}
                      title={review.name}
                      loading="lazy"
                    />
                  </ButtonBase>
                </Card>
              )}

              {review && review.images.length < 1 && (
                <Paper
                  sx={{
                    display: 'grid',
                    placeContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                  component={ButtonBase}
                  elevation={0}
                >
                  <Place color="primary" fontSize="large" />
                </Paper>
              )}

              <ImageListItemBar
                position="top"
                sx={{
                  background: 'transparent',
                  p: 1
                }}
                actionIcon={
                  review?.images.length > 1 && (
                    <PhotoLibrary htmlColor="white" fontSize="small" />
                  )
                }
              />

              <ImageListItemBar
                position="bottom"
                title={review?.name}
                subtitle={review?.map.name}
              />
            </Box>
          </MuiLink>
        )
      )}
    </Box>
  );
}

export default memo(ReviewGridList);
