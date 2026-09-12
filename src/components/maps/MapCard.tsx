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
import TypeMark, { TYPE_TITLE, TYPE_TITLE_TEXT } from '../common/TypeMark.tsx';

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

            <Box component="span" sx={TYPE_TITLE_TEXT}>
              {map.name}
            </Box>
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {map.author.name}
          </Typography>

          {/* Descriptions run from nothing to a paragraph, and the card keeps
              two lines for one either way so the cards beside it end level. */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2lh'
            }}
          >
            {map.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});
