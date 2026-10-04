import { Add, Check, Sell } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormLabel,
  Stack,
  Typography
} from '@mui/material';
import { useId, useState } from 'react';
import type {
  AppMap,
  PinProperty,
  PinPropertyOption
} from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import { chooseOptions } from '../../utils/pinPropertyOptions.ts';
import PinPropertiesDialog from '../maps/PinPropertiesDialog.tsx';

type FieldProps = {
  property: PinProperty;
  value: number[];
  disabled?: boolean;
  onChange: (optionIds: number[]) => void;
};

function PinPropertyField({ property, value, disabled, onChange }: FieldProps) {
  const chosenIds = property.options
    .map((option) => option.id)
    .filter((id) => value.includes(id));

  const handleToggle = (option: PinPropertyOption) => {
    if (chosenIds.includes(option.id)) {
      onChange(
        chooseOptions(
          value,
          property,
          chosenIds.filter((id) => id !== option.id)
        )
      );
    } else if (property.multiple) {
      onChange(chooseOptions(value, property, [...chosenIds, option.id]));
    } else {
      onChange(chooseOptions(value, property, [option.id]));
    }
  };

  return (
    <FormControl
      component="fieldset"
      fullWidth
      margin="normal"
      disabled={disabled}
    >
      <FormLabel
        component="legend"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
      >
        <Sell fontSize="small" />
        {property.name}
      </FormLabel>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {property.options.map((option) => {
          const chosen = chosenIds.includes(option.id);

          return (
            <Chip
              key={option.id}
              label={option.name}
              icon={chosen ? <Check /> : undefined}
              color={chosen ? 'secondary' : 'default'}
              variant={chosen ? 'filled' : 'outlined'}
              aria-pressed={chosen}
              disabled={disabled}
              onClick={() => handleToggle(option)}
            />
          );
        })}
      </Stack>
    </FormControl>
  );
}

type Props = {
  map: AppMap | null;
  pinProperties: PinProperty[];
  value: number[];
  disabled?: boolean;
  onChange: (optionIds: number[]) => void;
};

export default function PinPropertyOptionsField({
  map,
  pinProperties,
  value,
  disabled,
  onChange
}: Props) {
  const dictionary = useDictionary();
  const headingId = useId();

  const [managerOpen, setManagerOpen] = useState(false);
  const [managerKey, setManagerKey] = useState(0);

  const offeredProperties = pinProperties.filter(
    (property) => property.options.length > 0
  );

  if (!map?.editable && offeredProperties.length < 1) {
    return null;
  }

  const openManager = () => {
    setManagerKey(managerKey + 1);
    setManagerOpen(true);
  };

  return (
    <Box component="section" aria-labelledby={headingId} sx={{ mt: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography
          id={headingId}
          variant="subtitle1"
          component="h3"
          sx={{ flex: 1, minWidth: 0 }}
        >
          {dictionary['pin property fields']}
        </Typography>
        {map?.editable && (
          <Button
            size="small"
            color="secondary"
            startIcon={<Add />}
            aria-label={dictionary['add pin property']}
            onClick={openManager}
            disabled={disabled}
          >
            {dictionary.add}
          </Button>
        )}
      </Stack>

      {offeredProperties.map((property) => (
        <PinPropertyField
          key={property.id}
          property={property}
          value={value}
          disabled={disabled}
          onChange={onChange}
        />
      ))}

      {map?.editable && (
        <PinPropertiesDialog
          key={managerKey}
          open={managerOpen}
          onClose={() => setManagerOpen(false)}
          map={map}
          pinProperties={pinProperties}
          defaultCreating
        />
      )}
    </Box>
  );
}
