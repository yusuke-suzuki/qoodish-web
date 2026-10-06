'use client';

import { TextField } from '@mui/material';
import { type FormEvent, useState, useTransition } from 'react';
import type { PinPropertyOption } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import AppDialog from '../common/AppDialog.tsx';

const MAX_LENGTH = 30;

type Props = {
  option: PinPropertyOption | null;
  onClose: () => void;
  onRename: (option: PinPropertyOption, name: string) => Promise<boolean>;
};

export default function RenameOptionDialog({
  option,
  onClose,
  onRename
}: Props) {
  const dictionary = useDictionary();

  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();

  const trimmed = name.trim();
  const tooLong = trimmed.length > MAX_LENGTH;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!option) {
      return;
    }

    if (trimmed === option.name) {
      onClose();
      return;
    }

    startTransition(async () => {
      if (await onRename(option, trimmed)) {
        onClose();
      }
    });
  };

  return (
    <AppDialog
      open={Boolean(option)}
      onClose={onClose}
      title={dictionary.rename}
      maxWidth="xs"
      cancelLabel={dictionary.cancel}
      onEnter={() => setName(option?.name ?? '')}
      onSubmit={handleSubmit}
      confirmAction={{
        label: dictionary.save,
        type: 'submit',
        disabled: !trimmed || tooLong,
        loading: isPending
      }}
    >
      <TextField
        label={dictionary['pin property option name']}
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={tooLong}
        helperText={tooLong && dictionary['max characters 30']}
        disabled={isPending}
        fullWidth
        margin="dense"
        autoFocus
      />
    </AppDialog>
  );
}
