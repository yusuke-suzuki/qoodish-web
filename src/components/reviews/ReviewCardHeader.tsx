import { Box, CardHeader, Link as MuiLink, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, memo } from 'react';
import { Review } from '../../../types';
import AuthorAvatar from '../common/AuthorAvatar';

type Props = {
  review: Review;
  action: ReactNode;
  hideMapLink?: boolean;
  hideDate?: boolean;
};

function ReviewCardHeader({ review, action, hideMapLink, hideDate }: Props) {
  const router = useRouter();

  return (
    <CardHeader
      avatar={<AuthorAvatar author={review.author} />}
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
            href={`/users/${review.author.id}`}
            title={review.author.name}
          >
            {review.author.name}
          </MuiLink>

          {hideDate ? null : (
            <Typography variant="body2" color="text.secondary">
              {formatDistanceToNow(new Date(review.created_at), {
                addSuffix: true,
                locale: router.locale === 'ja' ? ja : enUS
              })}
            </Typography>
          )}
        </Box>
      }
      subheader={
        hideMapLink ? null : (
          <MuiLink
            underline="hover"
            component={Link}
            href={`/maps/${review.map.id}`}
            title={review.map.name}
          >
            {review.map.name}
          </MuiLink>
        )
      }
    />
  );
}

export default memo(ReviewCardHeader);
