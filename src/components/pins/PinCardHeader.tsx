import {
  Box,
  CardHeader,
  Link as MuiLink,
  type SxProps,
  Typography
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { memo, type ReactNode } from 'react';
import type { Pin } from '../../../types/index.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import AuthorAvatar from '../common/AuthorAvatar.tsx';

type Props = {
  pin: Pin | null;
  action: ReactNode;
  hideMapLink?: boolean;
  sx?: SxProps;
};

function PinCardHeader({ pin, action, hideMapLink, sx }: Props) {
  const { lang } = useParams<{ lang: string }>();
  const localePath = useLocalePath();

  return (
    <CardHeader
      sx={sx}
      avatar={pin && <AuthorAvatar author={pin.author} />}
      action={action}
      title={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <MuiLink
            underline="hover"
            color="inherit"
            component={Link}
            href={localePath(`/users/${pin?.author.id}`)}
            title={pin?.author.name}
          >
            {pin?.author.name}
          </MuiLink>

          {hideMapLink ? null : (
            <Typography variant="body2" color="text.secondary">
              {pin &&
                formatDistanceToNow(new Date(pin.created_at), {
                  addSuffix: true,
                  locale: lang === 'ja' ? ja : enUS
                })}
            </Typography>
          )}
        </Box>
      }
      subheader={
        hideMapLink ? (
          <Typography variant="body2" color="text.secondary">
            {pin &&
              formatDistanceToNow(new Date(pin.created_at), {
                addSuffix: true,
                locale: lang === 'ja' ? ja : enUS
              })}
          </Typography>
        ) : (
          <MuiLink
            underline="hover"
            component={Link}
            href={localePath(`/maps/${pin?.map.id}`)}
            title={pin?.map.name}
          >
            {pin?.map.name}
          </MuiLink>
        )
      }
    />
  );
}

export default memo(PinCardHeader);
