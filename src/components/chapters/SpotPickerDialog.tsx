import { Check, Close, HistoryEdu, Place } from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Slide,
  type SlideProps,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { memo } from 'react';
import type { Review } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import NoContents from '../common/NoContents';

function Transition({
  ref,
  ...props
}: SlideProps & { ref?: React.Ref<unknown> }) {
  return <Slide direction="up" ref={ref} {...props} />;
}

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
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={fullScreen}
      slots={{
        transition: Transition
      }}
    >
      {fullScreen ? (
        <AppBar color="transparent" position="relative" elevation={0}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={onClose}
              aria-label={dictionary.close}
            >
              <Close />
            </IconButton>
            <Typography
              variant="h6"
              component="h2"
              noWrap
              sx={{ flex: 1, ml: 1 }}
            >
              {dictionary['select pin']}
            </Typography>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>{dictionary['select pin']}</DialogTitle>
      )}
      <DialogContent dividers sx={{ p: 0 }}>
        {reviews.length < 1 ? (
          <NoContents
            icon={Place}
            message={dictionary['spots will see here']}
          />
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
      </DialogContent>
      {!fullScreen && (
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            {dictionary.cancel}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
});
