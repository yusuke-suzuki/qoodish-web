'use client';

import { Divider, Paper, Stack } from '@mui/material';
import { memo } from 'react';
import type { Chapter } from '../../../types/index.ts';
import ChapterCard from './ChapterCard.tsx';

type Props = {
  chapters: Chapter[];
};

function ChapterList({ chapters }: Props) {
  return (
    <Paper variant="outlined">
      <Stack divider={<Divider />}>
        {chapters.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} />
        ))}
      </Stack>
    </Paper>
  );
}

export default memo(ChapterList);
