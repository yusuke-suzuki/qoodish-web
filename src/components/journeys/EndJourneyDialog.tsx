import { Check, HistoryEdu, LocationOff } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';
import AppDialog from '../common/AppDialog';

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

  const handleExited = useCallback(() => setLoading(false), []);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['end journey']}
      maxWidth="xs"
      dividers
      disableClose={loading}
      onExited={handleExited}
      confirmAction={{
        label: dictionary['end journey'],
        color: 'success',
        startIcon: <Check />,
        loading,
        onClick: handleEnd
      }}
    >
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
    </AppDialog>
  );
});
