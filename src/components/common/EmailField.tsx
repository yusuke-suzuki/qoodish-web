import { TextField } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';

type Props = {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  disabled?: boolean;
};

function EmailField({ value, onChange, disabled }: Props) {
  const dictionary = useDictionary();
  const [touched, setTouched] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setTouched(false);
      setEmailError(null);
    }
  }, [value]);

  const validate = useCallback(
    (inputValue: string, validity: ValidityState): string | null => {
      const valid = !inputValue || validity.valid;
      return valid ? null : dictionary['email link error invalid email'];
    },
    [dictionary]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const valid = !e.target.value || e.target.validity.valid;
      if (touched) {
        setEmailError(validate(e.target.value, e.target.validity));
      }
      onChange(e.target.value, valid);
    },
    [touched, validate, onChange]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      setEmailError(validate(e.target.value, e.target.validity));
    },
    [validate]
  );

  return (
    <TextField
      label={dictionary['email link email']}
      type="email"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={!!emailError}
      helperText={emailError ?? ' '}
      required
      fullWidth
      disabled={disabled}
      variant="outlined"
    />
  );
}

export default memo(EmailField);
