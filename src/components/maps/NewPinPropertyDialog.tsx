'use client';

import {
  Autocomplete,
  FormControl,
  FormLabel,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { type FormEvent, useState, useTransition } from 'react';
import { createPinProperty } from '../../actions/pinProperties.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import AppDialog from '../common/AppDialog.tsx';
import PinPropertyTypeIcon from './PinPropertyTypeIcon.tsx';

const MAX_LENGTH = 30;

type Props = {
  open: boolean;
  onClose: () => void;
  mapId: number;
};

function uniqueNames(names: string[]): string[] {
  return Array.from(
    new Set(names.map((name) => name.trim()).filter((name) => name))
  );
}

export default function NewPinPropertyDialog({ open, onClose, mapId }: Props) {
  const dictionary = useDictionary();
  const router = useRouter();

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
      const result = await createPinProperty(mapId, {
        name: trimmed,
        multiple,
        options: submittedOptions
      });

      if (result.success) {
        router.refresh();
        onClose();
      }

      if (result.error || !result.success) {
        enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
          variant: 'error'
        });
      }
    });
  };

  const handleExited = () => {
    setName('');
    setMultiple(false);
    setOptions([]);
    setOptionInput('');
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={dictionary['add pin property']}
      fullScreenOnMobile
      cancelLabel={dictionary.cancel}
      disableClose={isPending}
      disableQuickDismiss
      onSubmit={handleSubmit}
      onExited={handleExited}
      confirmAction={{
        label: dictionary.add,
        type: 'submit',
        disabled: !trimmed || tooLong || optionTooLong,
        loading: isPending
      }}
    >
      <TextField
        label={dictionary['pin property name']}
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={tooLong}
        helperText={tooLong && dictionary['max characters 30']}
        disabled={isPending}
        fullWidth
        margin="normal"
        autoFocus
      />
      <FormControl component="fieldset" fullWidth margin="normal">
        <FormLabel component="legend" sx={{ mb: 1 }}>
          {dictionary['pin property type']}
        </FormLabel>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          color="secondary"
          value={multiple}
          onChange={(_event, value: boolean | null) => {
            if (value !== null) {
              setMultiple(value);
            }
          }}
          disabled={isPending}
        >
          <ToggleButton value={false}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PinPropertyTypeIcon multiple={false} />
              <span>{dictionary['single select']}</span>
            </Stack>
          </ToggleButton>
          <ToggleButton value={true}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PinPropertyTypeIcon multiple />
              <span>{dictionary['multi select']}</span>
            </Stack>
          </ToggleButton>
        </ToggleButtonGroup>
      </FormControl>
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
            margin="normal"
          />
        )}
      />
    </AppDialog>
  );
}
