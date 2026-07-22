'use client';

import {
  Button,
  type ButtonProps,
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
  title: string;
  description?: string;
  confirmLabel: string;
  confirmColor?: ButtonProps['color'];
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmColor = 'secondary',
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
      slotProps={{
        transition: {
          onExited: () => setLoading(false)
        }
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      {description && (
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          {dictionary.cancel}
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          loading={loading}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(ConfirmDialog);
