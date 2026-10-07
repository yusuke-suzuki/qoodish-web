'use client';

import { Autocomplete, Chip, TextField } from '@mui/material';
import { useState, useTransition } from 'react';
import type { PinPropertyOption } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';

const MAX_LENGTH = 30;

type Props = {
  options: PinPropertyOption[];
  onCreate: (name: string) => Promise<boolean>;
  onRename: (option: PinPropertyOption) => void;
  onDelete: (option: PinPropertyOption) => void;
};

export default function PinPropertyOptionsInput({
  options,
  onCreate,
  onRename,
  onDelete
}: Props) {
  const dictionary = useDictionary();

  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();

  const trimmed = input.trim();
  const tooLong = trimmed.length > MAX_LENGTH;

  const create = (name: string) => {
    const newName = name.trim();

    if (isPending || !newName || newName.length > MAX_LENGTH) {
      return;
    }

    if (options.some((option) => option.name === newName)) {
      setInput('');
      return;
    }

    startTransition(async () => {
      if (await onCreate(newName)) {
        setInput('');
      }
    });
  };

  return (
    <Autocomplete<PinPropertyOption | string, true, true, true>
      multiple
      freeSolo
      disableClearable
      options={[]}
      value={options}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.name
      }
      inputValue={input}
      onInputChange={(_event, value, reason) => {
        if (reason !== 'reset') {
          setInput(value);
        }
      }}
      onChange={(_event, _value, reason, details) => {
        const option = details?.option;

        if (reason === 'createOption' && typeof option === 'string') {
          create(option);
        }

        if (reason === 'removeOption' && option && typeof option !== 'string') {
          onDelete(option);
        }
      }}
      renderValue={(value, getItemProps) =>
        value.map((option, index) => {
          const { key, ...itemProps } = getItemProps({ index });

          return typeof option === 'string' ? null : (
            <Chip
              key={key}
              {...itemProps}
              label={option.name}
              onClick={() => onRename(option)}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={dictionary['pin property options']}
          error={tooLong}
          helperText={
            tooLong
              ? dictionary['max characters 30']
              : dictionary['add options with enter']
          }
          size="small"
        />
      )}
    />
  );
}
