import { HistoryEdu, Place } from '@mui/icons-material';
import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { memo, useCallback } from 'react';
import type { Review } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import AuthorAvatar from '../common/AuthorAvatar';
import NoContents from '../common/NoContents';

type Props = {
  reviews: Review[];
  onReviewClick?: (review: Review) => void;
};

function MapReviewList({ reviews, onReviewClick }: Props) {
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

  if (reviews.length < 1) {
    return (
      <NoContents icon={Place} message={dictionary['spots will see here']} />
    );
  }

  return (
    <List disablePadding>
      {reviews.map((review) => (
        <ListItemButton
          key={review.id}
          divider
          onClick={() => handleClick(review)}
          disableGutters
        >
          <ListItemAvatar>
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
          </ListItemAvatar>
          <ListItemText
            primary={review.name}
            secondary={review.comment}
            slotProps={{
              primary: {
                noWrap: true
              },
              secondary: {
                noWrap: true
              }
            }}
          />
          <AuthorAvatar
            key={review.id}
            author={review.author}
            sx={{
              width: 24,
              height: 24
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );
}

export default memo(MapReviewList);
