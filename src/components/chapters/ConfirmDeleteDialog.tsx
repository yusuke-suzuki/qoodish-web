'use client';

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel
} from '@mui/material';
import { memo, useCallback, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
};

function ConfirmDeleteDialog({ open, onClose, onConfirm, title }: Props) {
  const dictionary = useDictionary();

  const [check, setCheck] = useState(false);
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
      slotProps={{
        transition: {
          onExited: () => {
            setCheck(false);
            setLoading(false);
          }
        }
      }}
    >
      <DialogTitle>{title ?? dictionary['sure to delete chapter']}</DialogTitle>
      <DialogContent>
        <DialogContentText gutterBottom>
          {dictionary['this cannot be undone']}
        </DialogContentText>

        <FormControlLabel
          control={
            <Checkbox
              checked={check}
              onChange={() => setCheck((prev) => !prev)}
              color="success"
            />
          }
          label={dictionary['understand this cannot be undone']}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          {dictionary.cancel}
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={!check}
          loading={loading}
          onClick={handleConfirm}
        >
          {dictionary.delete}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(ConfirmDeleteDialog);
