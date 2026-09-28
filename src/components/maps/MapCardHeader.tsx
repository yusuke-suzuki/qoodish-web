import {
  CardHeader,
  Link as MuiLink,
  Skeleton,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo, type ReactNode } from 'react';
import type { AppMap } from '../../../types/index.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import useRelativeTime from '../../hooks/useRelativeTime.ts';
import AuthorAvatar from '../common/AuthorAvatar.tsx';

type Props = {
  map: AppMap | null;
  action: ReactNode;
};

function MapCardHeader({ map, action }: Props) {
  const localePath = useLocalePath();
  const formatRelativeTime = useRelativeTime();

  return (
    <CardHeader
      avatar={
        map ? (
          <AuthorAvatar author={map.author} />
        ) : (
          <Skeleton variant="circular" width={40} height={40} />
        )
      }
      action={action}
      title={
        map ? (
          <MuiLink
            underline="hover"
            color="inherit"
            component={Link}
            href={localePath(`/users/${map.author.id}`)}
            title={map.author.name}
          >
            {map.author.name}
          </MuiLink>
        ) : (
          <Skeleton height={20} width="50%" />
        )
      }
      subheader={
        map ? (
          <Typography variant="body2" color="text.secondary">
            {formatRelativeTime(map.created_at)}
          </Typography>
        ) : (
          <Skeleton height={20} width="50%" />
        )
      }
    />
  );
}

export default memo(MapCardHeader);
