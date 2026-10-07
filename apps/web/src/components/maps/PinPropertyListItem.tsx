'use client';

import { DeleteOutline } from '@mui/icons-material';
import {
  Box,
  IconButton,
  ListItem,
  ListItemIcon,
  Stack,
  Tooltip
} from '@mui/material';
import { useState } from 'react';
import type { PinProperty, PinPropertyOption } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import NameEditField from './NameEditField.tsx';
import PinPropertyOptionsInput from './PinPropertyOptionsInput.tsx';
import PinPropertyTypeIcon from './PinPropertyTypeIcon.tsx';
import RenameOptionDialog from './RenameOptionDialog.tsx';

type Props = {
  property: PinProperty;
  onRename: (name: string) => Promise<boolean>;
  onDelete: () => void;
  onCreateOption: (name: string) => Promise<boolean>;
  onRenameOption: (option: PinPropertyOption, name: string) => Promise<boolean>;
  onDeleteOption: (option: PinPropertyOption) => void;
};

export default function PinPropertyListItem({
  property,
  onRename,
  onDelete,
  onCreateOption,
  onRenameOption,
  onDeleteOption
}: Props) {
  const dictionary = useDictionary();

  const [renamingOption, setRenamingOption] =
    useState<PinPropertyOption | null>(null);

  const typeLabel = property.multiple
    ? dictionary['multi select']
    : dictionary['single select'];

  return (
    <ListItem sx={{ display: 'block', px: 0, py: 2 }}>
      <Stack direction="row" alignItems="center">
        <Tooltip title={typeLabel}>
          <ListItemIcon>
            <PinPropertyTypeIcon multiple={property.multiple} />
          </ListItemIcon>
        </Tooltip>
        <NameEditField
          label={dictionary['pin property name']}
          defaultValue={property.name}
          onSave={onRename}
        />
        <IconButton
          edge="end"
          aria-label={dictionary.delete}
          title={dictionary.delete}
          onClick={onDelete}
          sx={{ ml: 1 }}
        >
          <DeleteOutline />
        </IconButton>
      </Stack>

      <Box sx={{ mt: 2, pl: 7 }}>
        <PinPropertyOptionsInput
          options={property.options}
          onCreate={onCreateOption}
          onRename={setRenamingOption}
          onDelete={onDeleteOption}
        />
      </Box>

      <RenameOptionDialog
        option={renamingOption}
        onClose={() => setRenamingOption(null)}
        onRename={onRenameOption}
      />
    </ListItem>
  );
}
