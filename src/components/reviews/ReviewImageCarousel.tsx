'use client';

import { CardMedia } from '@mui/material';
import { memo } from 'react';
import type { Image } from '../../../types/index.ts';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

type Props = {
  images: Image[];
  alt: string;
  height: number;
};

function ReviewImageCarousel({ images, alt, height }: Props) {
  return (
    <Swiper pagination={true} modules={[Pagination]}>
      {images.map((image) => (
        <SwiperSlide key={image.id}>
          <CardMedia
            component="img"
            alt={alt}
            image={image.card}
            width={1200}
            height={630}
            sx={{ height, cursor: 'grab' }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default memo(ReviewImageCarousel);
