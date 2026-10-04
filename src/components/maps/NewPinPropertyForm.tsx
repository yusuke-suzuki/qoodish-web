'use client';

import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Stack,
  Switch,
  TextField
} from '@mui/material';
import { type FormEvent, useState, useTransition } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';

const MAX_LENGTH = 30;

export type NewPinProperty = {
  name: string;
  multiple: boolean;
  options: string[];
};

type Props = {
  onCreate: (property: NewPinProperty) => Promise<boolean>;
  onClose: () => void;
};

function uniqueNames(names: string[]): string[] {
  return Array.from(
    new Set(names.map((name) => name.trim()).filter((name) => name))
  );
}

export default function NewPinPropertyForm({ onCreate, onClose }: Props) {
  const dictionary = useDictionary();

  const [name, setName] = useState('');
  const [multiple, setMultiple] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState('');
  const [isPending, startTransition] = useTransition();

  const trimmed = name.trim();
  const tooLong = trimmed.length > MAX_LENGTH;
  const submittedOptions = uniqueNames([...options, optionInput]);
  const optionTooLong = submittedOptions.some(
    (option) => option.length > MAX_LENGTH
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const created = await onCreate({
        name: trimmed,
        multiple,
        options: submittedOptions
      });

      if (created) {
        onClose();
      }
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ py: 1.5 }}>
      <Stack spacing={1}>
        <TextField
          label={dictionary['pin property name']}
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={tooLong}
          helperText={tooLong && dictionary['max characters 30']}
          disabled={isPending}
          fullWidth
          margin="dense"
          autoFocus
        />
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={options}
          onChange={(_event, value) => setOptions(uniqueNames(value))}
          inputValue={optionInput}
          onInputChange={(_event, value) => setOptionInput(value)}
          disabled={isPending}
          renderInput={(params) => (
            <TextField
              {...params}
              label={dictionary['pin property options']}
              error={optionTooLong}
              helperText={
                optionTooLong
                  ? dictionary['max characters 30']
                  : dictionary['add options with enter']
              }
              margin="dense"
            />
          )}
        />
        <FormControl>
          <FormControlLabel
            control={
              <Switch
                color="secondary"
                checked={multiple}
                onChange={(_event, checked) => setMultiple(checked)}
                disabled={isPending}
              />
            }
            label={dictionary['allow several options']}
          />
          <FormHelperText>
            {dictionary['several options cannot change later']}
          </FormHelperText>
        </FormControl>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button color="inherit" onClick={onClose} disabled={isPending}>
            {dictionary.cancel}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={!trimmed || tooLong || optionTooLong}
            loading={isPending}
          >
            {dictionary.add}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
