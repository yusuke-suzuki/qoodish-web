'use client';

import { PhotoLibrary, Place } from '@mui/icons-material';
import { Box, ButtonBase, Typography } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Pin } from '../../../types/index.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import MediaPlaceholder from '../common/MediaPlaceholder.tsx';

type Props = {
  pin: Pin;
};

export default memo(function PinCard({ pin }: Props) {
  const localePath = useLocalePath();

  const [image] = pin.images;

  return (
    <ButtonBase
      component={Link}
      href={localePath(`/pins/${pin.id}`)}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        borderRadius: 1
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {image ? (
          <Box
            component="img"
            src={image.card}
            alt=""
            loading="lazy"
            sx={{
              display: 'block',
              width: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              borderRadius: 1
            }}
          />
        ) : (
          <MediaPlaceholder
            icon={Place}
            sx={{ aspectRatio: '1 / 1', borderRadius: 1 }}
          />
        )}

        {pin.images.length > 1 && (
          <PhotoLibrary
            htmlColor="white"
            fontSize="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          />
        )}
      </Box>

      <Typography variant="subtitle2" component="h3" noWrap sx={{ mt: 1 }}>
        {pin.name}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        noWrap
        sx={{ display: 'block' }}
      >
        {pin.map.name}
      </Typography>
    </ButtonBase>
  );
});
