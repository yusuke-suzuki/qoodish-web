import {
  ButtonBase,
  Card,
  CardMedia,
  ImageList,
  ImageListItem
} from '@mui/material';
import { memo } from 'react';
import type { Review } from '../../../types/index.ts';

type Props = {
  review: Review;
};

function ReviewImageList({ review }: Props) {
  return (
    <ImageList cols={2} gap={8}>
      {review.images.map((image) => (
        <ImageListItem
          key={image.id}
          sx={{ aspectRatio: '1 / 1', overflow: 'hidden' }}
        >
          <Card
            elevation={0}
            component="a"
            href={image.url}
            target="_blank"
            rel="noreferrer"
            sx={{ height: '100%' }}
          >
            <ButtonBase
              sx={{ display: 'block', width: '100%', height: '100%' }}
            >
              <CardMedia
                component="img"
                image={image.card}
                alt={review.name}
                loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </ButtonBase>
          </Card>
        </ImageListItem>
      ))}
    </ImageList>
  );
}

export default memo(ReviewImageList);
