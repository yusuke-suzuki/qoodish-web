'use client';

import { Lock, Map as MapIcon } from '@mui/icons-material';
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
import MediaPlaceholder from '../common/MediaPlaceholder.tsx';
import TypeMark, { TYPE_TITLE } from '../common/TypeMark.tsx';

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
            <MediaPlaceholder icon={MapIcon} />
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
          {/* One layout serves maps, reports and chapters, so the title is
              labelled with the mark of what it is. Beside the byline instead
              the mark read as part of the name — a place, not a person. */}
          <Typography variant="h6" component="h3" sx={TYPE_TITLE}>
            <TypeMark icon={MapIcon} />
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
