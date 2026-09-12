'use client';

import { HistoryEdu } from '@mui/icons-material';
import {
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
import MediaPlaceholder from '../common/MediaPlaceholder.tsx';
import TypeMark, { TYPE_TITLE } from '../common/TypeMark.tsx';

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
    <Card sx={{ height: '100%' }}>
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
          <MediaPlaceholder icon={HistoryEdu} />
        )}

        <CardContent>
          <Typography variant="h6" component="h3" sx={TYPE_TITLE}>
            <TypeMark icon={HistoryEdu} />
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
