'use client';

import { Lock, Photo } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
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

// Outlined rather than raised: the landing alternates a cream band with a white
// one, and a white card on the white band has no edge of its own.
export default memo(function MapCard({ map }: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardActionArea
        component={Link}
        href={localePath(`/maps/${map.id}`)}
        sx={{ height: '100%' }}
      >
        <Box sx={{ position: 'relative' }}>
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

          {map.private && (
            <Chip
              size="small"
              icon={<Lock fontSize="small" />}
              label={dictionary.private}
              sx={{ position: 'absolute', top: 8, left: 8 }}
            />
          )}
        </Box>

        <CardContent>
          <Typography variant="h6" component="h3">
            {map.name}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {map.author.name}
          </Typography>

          {/* Descriptions run to any length, and a rail or a grid of cards only
              reads as one while the cards are the same height. */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
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
