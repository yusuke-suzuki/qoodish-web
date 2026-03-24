import { HistoryEdu, Place } from '@mui/icons-material';
import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Skeleton
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { memo, useCallback } from 'react';
import type { Review } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import AuthorAvatar from '../common/AuthorAvatar';
import NoContents from '../common/NoContents';

type Props = {
  reviews: Review[];
  isLoading: boolean;
  onReviewClick?: (review: Review) => void;
};

function MapReviewList({ reviews, isLoading, onReviewClick }: Props) {
  const dictionary = useDictionary();
  const { push } = useRouter();
  const pathname = usePathname();

  const handleClick = useCallback(
    (review: Review) => {
      if (onReviewClick) {
        onReviewClick(review);
      }
      push(
        `${pathname}?lat=${review.latitude}&lng=${review.longitude}&zoom=17`,
        { scroll: false }
      );
    },
    [onReviewClick, push, pathname]
  );

  if (!isLoading && reviews.length < 1) {
    return (
      <NoContents icon={Place} message={dictionary['spots will see here']} />
    );
  }

  return (
    <List disablePadding>
      {(isLoading ? Array.from(new Array(6)) : reviews).map(
        (review: Review | null, i) => (
          <ListItemButton
            key={review ? review.id : i}
            divider
            onClick={() => review && handleClick(review)}
            disableGutters
          >
            <ListItemAvatar>
              {review ? (
                <>
                  {review.images.length > 0 ? (
                    <Avatar
                      alt={review.name}
                      variant="rounded"
                      src={review.images[0].thumbnail_url}
                    />
                  ) : (
                    <Avatar alt={review.name} variant="rounded">
                      <HistoryEdu />
                    </Avatar>
                  )}
                </>
              ) : (
                <Skeleton variant="rounded" width={40} height={40} />
              )}
            </ListItemAvatar>
            <ListItemText
              primary={review ? review.name : <Skeleton />}
              secondary={review ? review.comment : <Skeleton />}
              slotProps={{
                primary: {
                  noWrap: true
                },

                secondary: {
                  noWrap: true
                }
              }}
            />
            {review && (
              <AuthorAvatar
                key={review.id}
                author={review.author}
                sx={{
                  width: 24,
                  height: 24
                }}
              />
            )}
          </ListItemButton>
        )
      )}
    </List>
  );
}

export default memo(MapReviewList);
