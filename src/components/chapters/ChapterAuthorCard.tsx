'use client';

import { Box, Divider, Link as MuiLink, Typography } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Author, Journal } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import ProfileAvatar from '../common/ProfileAvatar.tsx';
import JournalBookmarkButton from '../profiles/JournalBookmarkButton.tsx';

type Props = {
  author: Author;
  journal: Journal | null;
  locale: string;
  pageCount: number;
};

function ChapterAuthorCard({ author, journal, locale, pageCount }: Props) {
  const dictionary = useDictionary();

  return (
    <Box sx={{ mt: 6 }}>
      <Divider sx={{ mb: 4 }} />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <ProfileAvatar profile={author} size={56} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" component="p">
            <MuiLink
              underline="hover"
              color="inherit"
              component={Link}
              href={`/${locale}/users/${author.id}`}
            >
              {author.name}
              {journal && ` / ${journal.title}`}
            </MuiLink>
          </Typography>

          {pageCount > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              {pageCount} {dictionary['chapters count']}
            </Typography>
          )}

          {author.biography && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
            >
              {author.biography}
            </Typography>
          )}

          {journal && (
            <Box sx={{ mt: 2 }}>
              <JournalBookmarkButton journal={journal} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default memo(ChapterAuthorCard);
