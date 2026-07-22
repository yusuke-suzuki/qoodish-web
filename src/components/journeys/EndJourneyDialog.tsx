import { Check, HistoryEdu, LocationOff } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slide,
  type SlideProps
} from '@mui/material';
import { memo, useCallback, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';

function Transition({
  ref,
  ...props
}: SlideProps & { ref?: React.Ref<unknown> }) {
  return <Slide direction="up" ref={ref} {...props} />;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onEnd: () => void | Promise<void>;
};

export default memo(function EndJourneyDialog({ open, onClose, onEnd }: Props) {
  const dictionary = useDictionary();

  const [loading, setLoading] = useState(false);

  const handleEnd = useCallback(async () => {
    setLoading(true);

    try {
      await onEnd();
    } finally {
      setLoading(false);
    }
  }, [onEnd]);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      slots={{
        transition: Transition
      }}
    >
      <DialogTitle>{dictionary['end journey']}</DialogTitle>
      <DialogContent dividers>
        <List disablePadding>
          <ListItem disableGutters>
            <ListItemIcon>
              <LocationOff />
            </ListItemIcon>
            <ListItemText
              primary={dictionary['end journey location']}
              slotProps={{
                primary: {
                  variant: 'body2'
                }
              }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>
              <HistoryEdu />
            </ListItemIcon>
            <ListItemText
              primary={dictionary['end journey journal']}
              slotProps={{
                primary: {
                  variant: 'body2'
                }
              }}
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          {dictionary.cancel}
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<Check />}
          loading={loading}
          onClick={handleEnd}
        >
          {dictionary['end journey']}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
