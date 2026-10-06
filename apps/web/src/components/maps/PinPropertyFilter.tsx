import { ArrowDropDown } from '@mui/icons-material';
import {
  Checkbox,
  Chip,
  ListItemText,
  Menu,
  MenuItem,
  Stack
} from '@mui/material';
import { useId, useState } from 'react';
import type { PinProperty } from '../../../types/index.ts';
import { chooseOptions } from '../../utils/pinPropertyOptions.ts';

type ChipProps = {
  property: PinProperty;
  value: number[];
  onChange: (optionIds: number[]) => void;
};

function PropertyFilterChip({ property, value, onChange }: ChipProps) {
  const menuId = useId();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const chosenIds = property.options
    .map((option) => option.id)
    .filter((id) => value.includes(id));

  const toggle = (optionId: number) => {
    onChange(
      chooseOptions(
        value,
        property,
        chosenIds.includes(optionId)
          ? chosenIds.filter((id) => id !== optionId)
          : [...chosenIds, optionId]
      )
    );
  };

  const active = chosenIds.length > 0;

  return (
    <>
      <Chip
        label={
          <Stack direction="row" alignItems="center">
            {active ? `${property.name} (${chosenIds.length})` : property.name}
            <ArrowDropDown fontSize="small" />
          </Stack>
        }
        color={active ? 'secondary' : 'default'}
        variant={active ? 'filled' : 'outlined'}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl)}
        aria-controls={anchorEl ? menuId : undefined}
        sx={{ bgcolor: active ? undefined : 'background.paper', boxShadow: 1 }}
      />
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ list: { 'aria-label': property.name } }}
      >
        {property.options.map((option) => (
          <MenuItem key={option.id} dense onClick={() => toggle(option.id)}>
            <Checkbox
              edge="start"
              size="small"
              checked={chosenIds.includes(option.id)}
              tabIndex={-1}
              disableRipple
            />
            <ListItemText primary={option.name} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

type Props = {
  pinProperties: PinProperty[];
  value: number[];
  onChange: (optionIds: number[]) => void;
};

export default function PinPropertyFilter({
  pinProperties,
  value,
  onChange
}: Props) {
  const offeredProperties = pinProperties.filter(
    (property) => property.options.length > 0
  );

  if (offeredProperties.length < 1) {
    return null;
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ overflowX: 'auto', py: 0.5 }}
    >
      {offeredProperties.map((property) => (
        <PropertyFilterChip
          key={property.id}
          property={property}
          value={value}
          onChange={onChange}
        />
      ))}
    </Stack>
  );
}
