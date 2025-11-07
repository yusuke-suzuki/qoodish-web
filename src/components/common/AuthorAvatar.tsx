import { Avatar, Link as MuiLink, type SxProps } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Author } from '../../../types';

type Props = {
  author: Author;
  sx?: SxProps;
};

export default memo(function AuthorAvatar({ author, sx }: Props) {
  return (
    <MuiLink
      component={Link}
      underline="none"
      href={`/users/${author.id}`}
      title={author.name}
    >
      <Avatar
        src={author.profile_image_url}
        alt={author.name}
        sx={sx}
        slotProps={{
          img: {
            loading: 'lazy'
          }
        }}
      />
    </MuiLink>
  );
});
