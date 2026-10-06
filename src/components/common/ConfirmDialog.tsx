'use client';

import { type ButtonProps, DialogContentText } from '@mui/material';
import { memo, useState } from 'react';
import AppDialog from './AppDialog.tsx';

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
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={title}
      disableClose={loading}
      onExited={() => setLoading(false)}
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
