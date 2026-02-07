import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { memo, useCallback, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  open: boolean;
  onClose: () => void;
  onUnlink: () => Promise<void>;
};

function UnlinkProviderDialog({ open, onClose, onUnlink }: Props) {
  const dictionary = useDictionary();
  const [loading, setLoading] = useState(false);

  const handleUnlink = useCallback(async () => {
    setLoading(true);

    try {
      await onUnlink();
      onClose();
    } finally {
      setLoading(false);
    }
  }, [onUnlink, onClose]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{dictionary['unlink provider']}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {dictionary['unlink provider detail']}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {dictionary.cancel}
        </Button>
        <Button
          variant="contained"
          onClick={handleUnlink}
          color="error"
          loading={loading}
        >
          {dictionary.unlink}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(UnlinkProviderDialog);
