import { Avatar, Link as MuiLink, type SxProps } from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import type { Author } from '../../../types/index.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';

type Props = {
  author: Author;
  sx?: SxProps;
};

export default memo(function AuthorAvatar({ author, sx }: Props) {
  const localePath = useLocalePath();

  return (
    <MuiLink
      component={Link}
      underline="none"
      href={localePath(`/users/${author.id}`)}
      title={author.name}
    >
      <Avatar
        src={author.image?.avatar}
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
