'use client';

import { AddLocationAlt, HistoryEdu, MyLocation } from '@mui/icons-material';
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
  onConfirm: () => void | Promise<void>;
};

export default memo(function StartJourneyDialog({
  open,
  onClose,
  onConfirm
}: Props) {
  const dictionary = useDictionary();

  const [loading, setLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    setLoading(true);

    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }, [onConfirm]);

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
      <DialogTitle>{dictionary['start journey']}</DialogTitle>
      <DialogContent dividers>
        <List disablePadding>
          <ListItem disableGutters>
            <ListItemIcon>
              <MyLocation />
            </ListItemIcon>
            <ListItemText
              primary={dictionary['start journey location']}
              slotProps={{
                primary: {
                  variant: 'body2'
                }
              }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>
              <AddLocationAlt />
            </ListItemIcon>
            <ListItemText
              primary={dictionary['start journey checkin']}
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
              primary={dictionary['start journey journal']}
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
          color="secondary"
          loading={loading}
          onClick={handleConfirm}
        >
          {dictionary['start journey']}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
