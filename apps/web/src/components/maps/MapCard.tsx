'use client';

import { Lock, Map as MapIcon } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  Chip,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { AppMap } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';

type Props = {
  map: AppMap;
};

export default memo(function MapCard({ map }: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        component={Link}
        href={localePath(`/maps/${map.id}`)}
        sx={{ height: '100%' }}
      >
        {map.image ? (
          <CardMedia
            component="img"
            image={map.image.hero}
            alt=""
            loading="lazy"
            sx={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
          />
        ) : (
          // Dark rather than the tinted ground the other placeholders take:
          // the name is set on this surface either way and has to stay legible
          // on it.
          <Box
            sx={{
              aspectRatio: '16 / 9',
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'grey.800'
            }}
          >
            <MapIcon
              fontSize="large"
              sx={{ color: 'rgba(255, 255, 255, 0.35)' }}
            />
          </Box>
        )}

        {map.private && (
          <Chip
            size="small"
            icon={<Lock fontSize="small" />}
            label={dictionary.private}
            sx={{ position: 'absolute', top: 8, left: 8 }}
          />
        )}

        <Box
          sx={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            p: { xs: 1.5, sm: 2 },
            color: 'common.white',
            background:
              'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.75) 100%)'
          }}
        >
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {map.name}
          </Typography>

          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            {map.author.name}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
});
