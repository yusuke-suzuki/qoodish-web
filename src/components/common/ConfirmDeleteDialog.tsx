'use client';

import { Checkbox, DialogContentText, FormControlLabel } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import AppDialog from './AppDialog.tsx';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

function ConfirmDeleteDialog({
  open,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm
}: Props) {
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

  const handleExited = useCallback(() => {
    setCheck(false);
    setLoading(false);
  }, []);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={title}
      disableClose={loading}
      onExited={handleExited}
      confirmAction={{
        label: confirmLabel ?? dictionary.delete,
        color: 'error',
        disabled: !check,
        loading,
        onClick: handleConfirm
      }}
    >
      <DialogContentText gutterBottom>
        {description ?? dictionary['this cannot be undone']}
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
    </AppDialog>
  );
}

export default memo(ConfirmDeleteDialog);
