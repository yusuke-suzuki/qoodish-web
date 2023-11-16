import { TextField } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';

const MAX_LENGTH = 160;

type Props = {
  onChange: (description: string | undefined) => void;
  defaultValue?: string;
};

function BiographyForm({ onChange, defaultValue }: Props) {
  const dictionary = useDictionary();

  const [biography, setBiography] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleChange = useCallback(
    (e) => {
      const input = e.target.value;

      if (input) {
        if (input.length > MAX_LENGTH) {
          setError(dictionary['max characters 160']);
        } else {
          setError(undefined);
        }
      } else {
        setError(dictionary['biography is required']);
      }

      setBiography(input);
    },
    [dictionary]
  );

  useEffect(() => {
    onChange(biography);
  }, [biography, onChange]);

  useEffect(() => {
    if (defaultValue) {
      setBiography(defaultValue);
    }
  }, [defaultValue]);

  return (
    <TextField
      label={dictionary.biography}
      onChange={handleChange}
      error={error ? true : false}
      helperText={error}
      fullWidth
      value={biography}
      margin="normal"
      variant="outlined"
      multiline
      minRows={3}
    />
  );
}

export default memo(BiographyForm);
