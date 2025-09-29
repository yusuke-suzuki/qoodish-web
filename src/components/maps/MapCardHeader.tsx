import {
  CardHeader,
  Link as MuiLink,
  Skeleton,
  Typography
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type ReactNode, memo } from 'react';
import type { AppMap } from '../../../types';
import AuthorAvatar from '../common/AuthorAvatar';

type Props = {
  map: AppMap | null;
  action: ReactNode;
};

function MapCardHeader({ map, action }: Props) {
  const router = useRouter();

  return (
    <CardHeader
      avatar={
        map ? (
          <AuthorAvatar author={map.owner} />
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
            href={`/users/${map.owner.id}`}
            title={map.owner.name}
          >
            {map.owner.name}
          </MuiLink>
        ) : (
          <Skeleton height={20} width="50%" />
        )
      }
      subheader={
        map ? (
          <Typography variant="body2" color="text.secondary">
            {formatDistanceToNow(new Date(map.created_at), {
              addSuffix: true,
              locale: router.locale === 'ja' ? ja : enUS
            })}
          </Typography>
        ) : (
          <Skeleton height={20} width="50%" />
        )
      }
    />
  );
}

export default memo(MapCardHeader);
