import { Description } from '@mui/icons-material';
import { InputAdornment, TextField } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';

const MAX_LENGTH = 500;

type Props = {
  onChange: (comment: string | null) => void;
  defaultValue?: string | null;
};

function ReviewDescriptionForm({ onChange, defaultValue }: Props) {
  const dictionary = useDictionary();

  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleCommentChange = useCallback(
    (e) => {
      const input = e.target.value;

      if (input) {
        if (input.length > MAX_LENGTH) {
          setError(dictionary['max characters 500']);
        } else {
          setError(null);
        }
      } else {
        setError(dictionary['comment is required']);
      }

      setComment(input);
    },
    [dictionary]
  );

  useEffect(() => {
    onChange(comment);
  }, [comment, onChange]);

  useEffect(() => {
    if (defaultValue) {
      setComment(defaultValue);
    }
  }, [defaultValue]);

  return (
    <TextField
      label={dictionary.description}
      onChange={handleCommentChange}
      error={error ? true : false}
      helperText={error}
      fullWidth
      value={comment}
      multiline
      margin="normal"
      variant="outlined"
      minRows={3}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Description />
          </InputAdornment>
        )
      }}
    />
  );
}

export default memo(ReviewDescriptionForm);
