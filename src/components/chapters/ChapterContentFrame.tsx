'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { chapterContentStyles } from './chapterContentTheme.ts';

type Props = {
  children: ReactNode;
};

export default function ChapterContentFrame({ children }: Props) {
  return (
    <Box
      sx={(theme) => ({
        typography: 'body1',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...chapterContentStyles(theme)
      })}
    >
      {children}
    </Box>
  );
}
