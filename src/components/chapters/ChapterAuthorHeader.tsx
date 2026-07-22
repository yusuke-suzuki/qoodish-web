'use client';

import { Box, Link as MuiLink, Typography } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Author } from '../../../types';
import ProfileAvatar from '../common/ProfileAvatar';

type Props = {
  author: Author | null;
  locale: string;
};

function ChapterAuthorHeader({ author, locale }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <ProfileAvatar profile={author} size={32} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {author && (
          <MuiLink
            underline="hover"
            color="inherit"
            component={Link}
            href={`/${locale}/users/${author.id}`}
            title={author.name}
          >
            <Typography variant="subtitle2" component="span" noWrap>
              {author.name}
            </Typography>
          </MuiLink>
        )}
      </Box>
    </Box>
  );
}

export default memo(ChapterAuthorHeader);
