import { Box, ButtonBase, ImageList, ImageListItem } from '@mui/material';
import { memo } from 'react';
import type { Review } from '../../../types/index.ts';

type Props = {
  review: Review;
};

function ReviewImageList({ review }: Props) {
  const { images } = review;

  return (
    <ImageList cols={2} gap={8}>
      {images.map((image, index) => (
        <ImageListItem key={image.id} sx={{ aspectRatio: '1 / 1' }}>
          <ButtonBase
            component="a"
            href={image.url}
            target="_blank"
            rel="noreferrer"
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <Box
              component="img"
              src={image.card}
              // The link takes its name from this text, so one report's
              // photographs have to be told apart by it.
              alt={
                images.length > 1
                  ? `${review.name} (${index + 1}/${images.length})`
                  : review.name
              }
              loading="lazy"
              sx={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </ButtonBase>
        </ImageListItem>
      ))}
    </ImageList>
  );
}

export default memo(ReviewImageList);
