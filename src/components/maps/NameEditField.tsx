'use client';

import { TextField } from '@mui/material';
import { type FormEvent, useRef, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';

const MAX_LENGTH = 30;

type Props = {
  label: string;
  defaultValue: string;
  onSave: (name: string) => Promise<boolean>;
};

export default function NameEditField({ label, defaultValue, onSave }: Props) {
  const dictionary = useDictionary();

  const [name, setName] = useState(defaultValue);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const cancelledRef = useRef(false);

  const trimmed = name.trim();
  const tooLong = trimmed.length > MAX_LENGTH;

  const commit = async () => {
    if (savingRef.current || cancelledRef.current) {
      return;
    }

    if (!trimmed || trimmed === defaultValue) {
      setName(defaultValue);
      return;
    }

    if (tooLong) {
      return;
    }

    savingRef.current = true;
    setSaving(true);

    await onSave(trimmed);

    savingRef.current = false;
    setSaving(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    commit();
  };

  return (
    <form onSubmit={handleSubmit} style={{ flex: 1, minWidth: 0 }}>
      <TextField
        value={name}
        onChange={(event) => {
          cancelledRef.current = false;
          setName(event.target.value);
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            cancelledRef.current = true;
            setName(defaultValue);
          }
        }}
        label={label}
        error={tooLong}
        helperText={tooLong && dictionary['max characters 30']}
        disabled={saving}
        size="small"
        fullWidth
      />
    </form>
  );
}
