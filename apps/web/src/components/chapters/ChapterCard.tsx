'use client';

import { HistoryEdu } from '@mui/icons-material';
import { Box, CardActionArea, CardMedia, Typography } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Chapter } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';

type Props = {
  chapter: Chapter;
};

const THUMBNAIL_SIZE = { xs: 80, sm: 100 };

export default memo(function ChapterCard({ chapter }: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  // A chapter belongs either to a map or to a journal, and which one it is is
  // the only context a reader has for the title before opening it.
  const source = chapter.map?.name ?? chapter.journal?.title;

  return (
    <CardActionArea
      component={Link}
      href={localePath(`/chapters/${chapter.id}`)}
      sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {chapter.title || dictionary['untitled chapter']}
        </Typography>

        {source && (
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ mt: 0.5 }}
          >
            {source}
          </Typography>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1.5 }}
        >
          {chapter.author.name}
        </Typography>
      </Box>

      {chapter.image ? (
        <CardMedia
          component="img"
          image={chapter.image.card}
          alt=""
          loading="lazy"
          sx={{
            width: THUMBNAIL_SIZE,
            height: THUMBNAIL_SIZE,
            flexShrink: 0,
            borderRadius: 1,
            objectFit: 'cover'
          }}
        />
      ) : (
        <Box
          sx={{
            width: THUMBNAIL_SIZE,
            height: THUMBNAIL_SIZE,
            flexShrink: 0,
            borderRadius: 1,
            bgcolor: 'action.hover',
            display: 'grid',
            placeItems: 'center'
          }}
        >
          <HistoryEdu color="disabled" />
        </Box>
      )}
    </CardActionArea>
  );
});
