import { TextField } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';

const MAX_LENGTH = 30;

type Props = {
  onChange: (description: string | undefined) => void;
  defaultValue?: string | null;
};

export default memo(function MapNameForm({ onChange, defaultValue }: Props) {
  const dictionary = useDictionary();

  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleNameChange = useCallback(
    (e) => {
      const input = e.target.value;

      if (input) {
        if (input.length > MAX_LENGTH) {
          setError(dictionary['max characters 30']);
        } else {
          setError(null);
        }
      } else {
        setError(dictionary['map name is required']);
      }

      setName(input);
    },
    [dictionary]
  );

  useEffect(() => {
    onChange(name);
  }, [name, onChange]);

  useEffect(() => {
    if (defaultValue) {
      setName(defaultValue);
    }
  }, [defaultValue]);

  return (
    <TextField
      label={dictionary['map name']}
      onChange={handleNameChange}
      error={error ? true : false}
      helperText={error}
      fullWidth
      value={name}
      margin="normal"
      variant="outlined"
    />
  );
});
