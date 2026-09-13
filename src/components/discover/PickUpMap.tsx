'use client';

import { Map as MapIcon } from '@mui/icons-material';
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
import MediaPlaceholder from '../common/MediaPlaceholder.tsx';

type Props = {
  map: AppMap | null;
};

// A ratio rather than a height, so the picture does not flatten as the column
// widens, with a ceiling so that the full width of a desk does not hand one
// map most of the screen.
const COVER = {
  aspectRatio: '16 / 9',
  maxHeight: { xs: 220, sm: 320, md: 400 }
};

function PickUpMap({ map }: Props) {
  const localePath = useLocalePath();

  if (!map) {
    return null;
  }

  return (
    <Card>
      <CardActionArea
        component={Link}
        href={localePath(`/maps/${map.id}`)}
        title={map.name}
      >
        {map.image ? (
          <CardMedia
            component="img"
            image={map.image.hero}
            alt={map.name}
            loading="lazy"
            sx={{ ...COVER, objectFit: 'cover' }}
          />
        ) : (
          <MediaPlaceholder icon={MapIcon} sx={COVER} />
        )}

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
