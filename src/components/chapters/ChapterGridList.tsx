'use client';

import { Box } from '@mui/material';
import { memo } from 'react';
import type { Chapter } from '../../../types/index.ts';
import ChapterCard from './ChapterCard.tsx';

type Props = {
  chapters: Chapter[];
};

// Above a phone the columns follow the width the grid is actually given, so the
// same list works in the main column and in a narrower one. A phone is narrower
// than one of those columns, and a single column of cards makes a browsing page
// as long to scroll as the rails on the landing were meant to avoid.
const gridTemplateColumns = {
  xs: 'repeat(2, 1fr)',
  sm: 'repeat(auto-fill, minmax(240px, 1fr))'
};

function ChapterGridList({ chapters }: Props) {
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns }}>
      {chapters.map((chapter) => (
        <ChapterCard key={chapter.id} chapter={chapter} />
      ))}
    </Box>
  );
}

export default memo(ChapterGridList);
