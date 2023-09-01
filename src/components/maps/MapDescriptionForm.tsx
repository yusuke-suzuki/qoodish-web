import { TextField } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';

const MAX_LENGTH = 200;

type Props = {
  onChange: (description: string | undefined) => void;
  defaultValue?: string | undefined;
};

export default memo(function MapDescriptionForm({
  onChange,
  defaultValue
}: Props) {
  const dictionary = useDictionary();

  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleDescriptionChange = useCallback(
    (e) => {
      const input = e.target.value;

      if (input) {
        if (input.length > MAX_LENGTH) {
          setError(dictionary['max characters 200']);
        } else {
          setError(null);
        }
      } else {
        setError(dictionary['description is required']);
      }
      setDescription(input);
    },
    [dictionary]
  );

  useEffect(() => {
    onChange(description);
  }, [description, onChange]);

  useEffect(() => {
    if (defaultValue) {
      setDescription(defaultValue);
    }
  }, [defaultValue]);

  return (
    <TextField
      label={dictionary.description}
      onChange={handleDescriptionChange}
      error={error ? true : false}
      helperText={error}
      fullWidth
      value={description}
      multiline
      minRows={3}
      margin="normal"
      variant="outlined"
    />
  );
});
