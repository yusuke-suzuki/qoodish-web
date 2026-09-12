'use client';

import { Photo } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { AppMap } from '../../../types/index.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';

type Props = {
  map: AppMap;
};

export default memo(function LandingMapCard({ map }: Props) {
  const localePath = useLocalePath();

  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardActionArea
        component={Link}
        href={localePath(`/maps/${map.id}`)}
        sx={{ height: '100%' }}
      >
        {map.image ? (
          <CardMedia
            component="img"
            image={map.image.card}
            alt={map.name}
            loading="lazy"
            sx={{ aspectRatio: '3 / 2', objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              aspectRatio: '3 / 2',
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'action.hover'
            }}
          >
            <Photo color="disabled" fontSize="large" />
          </Box>
        )}

        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {map.name}
          </Typography>

          {/* Descriptions run to any length, and a rail of cards only reads as
              a rail while the cards are the same height. */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {map.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});
