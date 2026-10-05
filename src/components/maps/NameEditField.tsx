'use client';

import { TextField } from '@mui/material';
import { type FormEvent, useRef, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';

const MAX_LENGTH = 30;

type Props = {
  label: string;
  defaultValue?: string;
  clearOnSave?: boolean;
  onSave: (name: string) => Promise<boolean>;
  onDone: () => void;
};

export default function NameEditField({
  label,
  defaultValue = '',
  clearOnSave = false,
  onSave,
  onDone
}: Props) {
  const dictionary = useDictionary();

  const [name, setName] = useState(defaultValue);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const cancelledRef = useRef(false);

  const trimmed = name.trim();
  const tooLong = trimmed.length > MAX_LENGTH;

  const commit = async ({ closeAfterSave }: { closeAfterSave: boolean }) => {
    if (savingRef.current || cancelledRef.current) {
      return;
    }

    if (!trimmed || trimmed === defaultValue) {
      onDone();
      return;
    }

    if (tooLong) {
      return;
    }

    savingRef.current = true;
    setSaving(true);

    const saved = await onSave(trimmed);

    savingRef.current = false;
    setSaving(false);

    if (!saved) {
      return;
    }

    if (closeAfterSave) {
      onDone();
    } else {
      setName('');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    commit({ closeAfterSave: !clearOnSave });
  };

  return (
    <form onSubmit={handleSubmit} style={{ flex: 1, minWidth: 0 }}>
      <TextField
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => commit({ closeAfterSave: true })}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            cancelledRef.current = true;
            onDone();
          }
        }}
        label={label}
        error={tooLong}
        helperText={tooLong && dictionary['max characters 30']}
        disabled={saving}
        size="small"
        fullWidth
        autoFocus
      />
    </form>
  );
}
