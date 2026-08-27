'use client';

import { AddLocationAlt, HistoryEdu, MyLocation } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import AppDialog from '../common/AppDialog.tsx';

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

  const handleExited = useCallback(() => setLoading(false), []);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['start journey']}
      maxWidth="xs"
      dividers
      disableClose={loading}
      onExited={handleExited}
      confirmAction={{
        label: dictionary['start journey'],
        loading,
        onClick: handleConfirm
      }}
    >
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
    </AppDialog>
  );
});
