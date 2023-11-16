import { PhotoLibrary, Place } from '@mui/icons-material';
import {
  ButtonBase,
  Card,
  CardMedia,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Link as MuiLink,
  Paper,
  Skeleton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import { Review } from '../../../types';

type Props = {
  reviews: Review[];
  hideSkeleton?: boolean;
};

function ReviewGridList({ reviews, hideSkeleton }: Props) {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  if (reviews.length < 1 && hideSkeleton) {
    return null;
  }

  return (
    <ImageList cols={smUp ? 3 : 2} rowHeight={180} sx={{ m: 0 }} gap={8}>
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
            <ImageListItem>
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
                  review?.images.length > 0 && (
                    <PhotoLibrary htmlColor="white" fontSize="small" />
                  )
                }
              />

              <ImageListItemBar
                position="bottom"
                title={review?.name}
                subtitle={review?.map.name}
              />
            </ImageListItem>
          </MuiLink>
        )
      )}
    </ImageList>
  );
}

export default memo(ReviewGridList);
