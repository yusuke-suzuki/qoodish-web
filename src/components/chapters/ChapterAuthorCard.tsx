'use client';

import { Box, Divider, Link as MuiLink, Typography } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Author } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import ProfileAvatar from '../common/ProfileAvatar';

type Props = {
  author: Author;
  locale: string;
  pageCount: number;
};

function ChapterAuthorCard({ author, locale, pageCount }: Props) {
  const dictionary = useDictionary();

  return (
    <Box sx={{ mt: 6 }}>
      <Divider sx={{ mb: 4 }} />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <ProfileAvatar profile={author} size={56} />

        <Box sx={{ minWidth: 0 }}>
          <MuiLink
            underline="hover"
            color="inherit"
            component={Link}
            href={`/${locale}/users/${author.id}`}
            title={author.name}
          >
            <Typography variant="h6" component="p" noWrap>
              {author.name}
            </Typography>
          </MuiLink>

          {pageCount > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              {pageCount} {dictionary['pages count']}
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
        </Box>
      </Box>
    </Box>
  );
}

export default memo(ChapterAuthorCard);
