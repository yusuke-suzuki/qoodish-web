import {
  ButtonBase,
  Card,
  CardMedia,
  ImageList,
  ImageListItem
} from '@mui/material';
import { memo } from 'react';
import type { Review } from '../../../types';

type Props = {
  review: Review;
};

function ReviewImageList({ review }: Props) {
  return (
    <ImageList cols={2} gap={8}>
      {review.images.map((image) => (
        <ImageListItem key={image.id}>
          <Card
            elevation={0}
            component="a"
            href={image.url}
            target="_blank"
            rel="noreferrer"
            sx={{ height: '100%' }}
          >
            <ButtonBase>
              <CardMedia
                component="img"
                image={image.thumbnail_url_400}
                height="100%"
                alt={review.name}
                loading="lazy"
              />
            </ButtonBase>
          </Card>
        </ImageListItem>
      ))}
    </ImageList>
  );
}

export default memo(ReviewImageList);
