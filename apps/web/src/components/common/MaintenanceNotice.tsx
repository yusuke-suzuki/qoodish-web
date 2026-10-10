'use client';

import { Button } from '@mui/material';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import { useEffect, useEffectEvent } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';

type Props = {
  message: string | null;
};

export default function MaintenanceNotice({ message }: Props) {
  const dictionary = useDictionary();

  const announce = useEffectEvent((text: string) =>
    enqueueSnackbar(text, {
      variant: 'warning',
      preventDuplicate: false,
      persist: true,
      action: (snackbarId) => (
        <Button color="inherit" onClick={() => closeSnackbar(snackbarId)}>
          {dictionary.close}
        </Button>
      )
    })
  );

  useEffect(() => {
    if (!message) return;

    const snackbarId = announce(message);

    return () => closeSnackbar(snackbarId);
  }, [message]);

  return null;
}
