import { HistoryEdu, Place } from '@mui/icons-material';
import {
  Avatar,
  Box,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { memo } from 'react';
import type { Review } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import AuthorAvatar from '../common/AuthorAvatar.tsx';
import NoContents from '../common/NoContents.tsx';

type Props = {
  reviews: Review[];
  onReviewClick?: (review: Review) => void;
};

function MapReviewList({ reviews, onReviewClick }: Props) {
  const dictionary = useDictionary();
  const { push } = useRouter();
  const pathname = usePathname();

  const handleClick = (review: Review) => {
    if (onReviewClick) {
      onReviewClick(review);
    }
    push(`${pathname}?lat=${review.latitude}&lng=${review.longitude}&zoom=17`, {
      scroll: false
    });
  };

  // The rows carry their own padding, so the panel around this list has none
  // to give the empty state.
  if (reviews.length < 1) {
    return (
      <Box sx={{ py: 4 }}>
        <NoContents icon={Place} message={dictionary['spots will see here']} />
      </Box>
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
                src={review.images[0].avatar}
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
