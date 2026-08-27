import { Check, HistoryEdu, Place } from '@mui/icons-material';
import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { memo } from 'react';
import type { Review } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import AppDialog from '../common/AppDialog.tsx';
import NoContents from '../common/NoContents.tsx';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (review: Review) => void;
  reviews: Review[];
  usedReviewIds: Set<number>;
};

export default memo(function SpotPickerDialog({
  open,
  onClose,
  onSelect,
  reviews,
  usedReviewIds
}: Props) {
  const dictionary = useDictionary();

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['select pin']}
      fullScreenOnMobile
      dividers
      disableContentPadding
      cancelLabel={dictionary.close}
    >
      {reviews.length < 1 ? (
        <NoContents icon={Place} message={dictionary['spots will see here']} />
      ) : (
        <List disablePadding>
          {reviews.map((review) => (
            <ListItemButton
              key={review.id}
              divider
              onClick={() => onSelect(review)}
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
              {usedReviewIds.has(review.id) && (
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <Check color="disabled" fontSize="small" />
                </ListItemIcon>
              )}
            </ListItemButton>
          ))}
        </List>
      )}
    </AppDialog>
  );
});
