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
import type { Review } from '../../../types';
import useLocalePath from '../../hooks/useLocalePath';
import AuthorAvatar from '../common/AuthorAvatar';

type Props = {
  review: Review | null;
  action: ReactNode;
  hideMapLink?: boolean;
  sx?: SxProps;
};

function ReviewCardHeader({ review, action, hideMapLink, sx }: Props) {
  const { lang } = useParams<{ lang: string }>();
  const localePath = useLocalePath();

  return (
    <CardHeader
      sx={sx}
      avatar={review && <AuthorAvatar author={review.author} />}
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
            href={localePath(`/users/${review?.author.id}`)}
            title={review?.author.name}
          >
            {review?.author.name}
          </MuiLink>

          {hideMapLink ? null : (
            <Typography variant="body2" color="text.secondary">
              {review &&
                formatDistanceToNow(new Date(review.created_at), {
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
            {review &&
              formatDistanceToNow(new Date(review.created_at), {
                addSuffix: true,
                locale: lang === 'ja' ? ja : enUS
              })}
          </Typography>
        ) : (
          <MuiLink
            underline="hover"
            component={Link}
            href={localePath(`/maps/${review?.map.id}`)}
            title={review?.map.name}
          >
            {review?.map.name}
          </MuiLink>
        )
      }
    />
  );
}

export default memo(ReviewCardHeader);
