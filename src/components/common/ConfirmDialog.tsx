'use client';

import { type ButtonProps, DialogContentText } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';
import AppDialog from './AppDialog';

type Props = {
  open: boolean;
  title: string;
  description: string;
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

  const handleExited = useCallback(() => setLoading(false), []);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={title}
      disableClose={loading}
      onExited={handleExited}
      confirmAction={{
        label: confirmLabel,
        color: confirmColor,
        loading,
        onClick: handleConfirm
      }}
    >
      <DialogContentText>{description}</DialogContentText>
    </AppDialog>
  );
}

export default memo(ConfirmDialog);
