import { TextField } from '@mui/material';
import { type ChangeEvent, memo, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';

const MAX_LENGTH = 50;

type Props = {
  onChange: (title: string | undefined) => void;
  defaultValue?: string;
};

function JournalTitleForm({ onChange, defaultValue }: Props) {
  const dictionary = useDictionary();

  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (input) {
      if (input.length > MAX_LENGTH) {
        setError(dictionary['max characters 50']);
      } else {
        setError(undefined);
      }
    } else {
      setError(dictionary['journal title required']);
    }

    setTitle(input);
  };

  // Reports undefined while invalid so the caller can block saving a title the
  // API would reject.
  useEffect(() => {
    onChange(!title || title.length > MAX_LENGTH ? undefined : title);
  }, [title, onChange]);

  useEffect(() => {
    if (defaultValue) {
      setTitle(defaultValue);
    }
  }, [defaultValue]);

  return (
    <TextField
      label={dictionary['journal title']}
      onChange={handleChange}
      error={!!error}
      helperText={error}
      fullWidth
      value={title}
      margin="normal"
      variant="outlined"
    />
  );
}

export default memo(JournalTitleForm);
