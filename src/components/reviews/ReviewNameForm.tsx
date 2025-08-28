import { TextField } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';

const MAX_LENGTH = 30;

type Props = {
  onChange: (name: string | null) => void;
  defaultValue?: string;
};

function ReviewNameForm({ onChange, defaultValue }: Props) {
  const dictionary = useDictionary();

  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleChange = useCallback(
    (e) => {
      const input = e.target.value;

      if (input) {
        if (input.length > MAX_LENGTH) {
          setError(dictionary['max characters 30']);
        } else {
          setError(null);
        }
      } else {
        setError(dictionary['name is required']);
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
      label={dictionary.name}
      onChange={handleChange}
      error={!!error}
      helperText={error}
      fullWidth
      value={name}
      margin="normal"
      variant="outlined"
    />
  );
}

export default memo(ReviewNameForm);
