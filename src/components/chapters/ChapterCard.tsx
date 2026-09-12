'use client';

import { HistoryEdu } from '@mui/icons-material';
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
import type { Chapter } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';

type Props = {
  chapter: Chapter;
};

export default memo(function ChapterCard({ chapter }: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  // A chapter belongs either to a map or to a journal, and which one it is is
  // the only context a reader has for the title before opening it.
  const source = chapter.map?.name ?? chapter.journal?.title;

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardActionArea
        component={Link}
        href={localePath(`/chapters/${chapter.id}`)}
        sx={{ height: '100%' }}
      >
        {chapter.image ? (
          <CardMedia
            component="img"
            image={chapter.image.card}
            alt={chapter.title}
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
            <HistoryEdu color="disabled" fontSize="large" />
          </Box>
        )}

        <CardContent>
          <Typography variant="h6" component="h3">
            {chapter.title || dictionary['untitled chapter']}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {chapter.author.name}
          </Typography>

          {source && (
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ mt: 1 }}
            >
              {source}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
});
