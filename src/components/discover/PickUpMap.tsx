'use client';

import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { AppMap } from '../../../types/index.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';

type Props = {
  map: AppMap | null;
};

function PickUpMap({ map }: Props) {
  const localePath = useLocalePath();

  if (!map) {
    return null;
  }

  return (
    <Card elevation={0}>
      <CardActionArea
        component={Link}
        href={localePath(`/maps/${map.id}`)}
        title={map.name}
      >
        <CardMedia
          component="img"
          image={map.image?.hero}
          alt={map.name}
          loading="lazy"
          sx={{ height: 240, objectFit: 'cover' }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            p: 2,
            color: 'common.white',
            background:
              'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)'
          }}
        >
          <Typography sx={{ typography: { xs: 'h5', sm: 'h4' } }}>
            {map.name}
          </Typography>

          <Typography sx={{ typography: { xs: 'subtitle2', sm: 'subtitle1' } }}>
            {map.author.name}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export default memo(PickUpMap);
