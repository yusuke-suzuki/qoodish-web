'use client';

import {
  Add,
  ArrowDropDownCircleOutlined,
  FormatListBulleted,
  MoreVert
} from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack
} from '@mui/material';
import { useState } from 'react';
import type { PinProperty, PinPropertyOption } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import NameEditField from './NameEditField.tsx';

type Props = {
  property: PinProperty;
  onRename: (name: string) => Promise<boolean>;
  onDelete: () => void;
  onCreateOption: (name: string) => Promise<boolean>;
  onRenameOption: (option: PinPropertyOption, name: string) => Promise<boolean>;
  onDeleteOption: (option: PinPropertyOption) => void;
};

type OptionMenu = {
  anchorEl: HTMLElement;
  option: PinPropertyOption;
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

  const [renaming, setRenaming] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [optionMenu, setOptionMenu] = useState<OptionMenu | null>(null);
  const [renamingOptionId, setRenamingOptionId] = useState<number | null>(null);
  const [addingOption, setAddingOption] = useState(false);

  const typeLabel = property.multiple
    ? dictionary['multi select']
    : dictionary['single select'];

  return (
    <ListItem divider sx={{ display: 'block', px: 0, py: 1.5 }}>
      <Stack direction="row" alignItems="center">
        <ListItemIcon title={typeLabel}>
          {property.multiple ? (
            <FormatListBulleted />
          ) : (
            <ArrowDropDownCircleOutlined />
          )}
        </ListItemIcon>
        {renaming ? (
          <NameEditField
            label={dictionary['pin property name']}
            defaultValue={property.name}
            onSave={onRename}
            onDone={() => setRenaming(false)}
          />
        ) : (
          <ListItemText primary={property.name} secondary={typeLabel} />
        )}
        <IconButton
          edge="end"
          aria-label={dictionary.more}
          title={dictionary.more}
          onClick={(event) => setMenuAnchorEl(event.currentTarget)}
        >
          <MoreVert />
        </IconButton>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
          mt: 1,
          pl: 7
        }}
      >
        {property.options.map((option) =>
          renamingOptionId === option.id ? (
            <NameEditField
              key={option.id}
              label={dictionary['pin property option name']}
              defaultValue={option.name}
              onSave={(name) => onRenameOption(option, name)}
              onDone={() => setRenamingOptionId(null)}
            />
          ) : (
            <Chip
              key={option.id}
              label={option.name}
              onClick={(event) =>
                setOptionMenu({ anchorEl: event.currentTarget, option })
              }
            />
          )
        )}
        {addingOption ? (
          <NameEditField
            label={dictionary['pin property option name']}
            clearOnSave
            onSave={onCreateOption}
            onDone={() => setAddingOption(false)}
          />
        ) : (
          <Chip
            variant="outlined"
            icon={<Add />}
            label={dictionary['add pin property option']}
            onClick={() => setAddingOption(true)}
          />
        )}
      </Box>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchorEl(null);
            setRenaming(true);
          }}
        >
          <ListItemText primary={dictionary.rename} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchorEl(null);
            onDelete();
          }}
        >
          <ListItemText
            primary={dictionary.delete}
            slotProps={{ primary: { color: 'error' } }}
          />
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={optionMenu?.anchorEl}
        open={Boolean(optionMenu)}
        onClose={() => setOptionMenu(null)}
      >
        <MenuItem
          onClick={() => {
            setRenamingOptionId(optionMenu?.option.id ?? null);
            setOptionMenu(null);
          }}
        >
          <ListItemText primary={dictionary.rename} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (optionMenu) {
              onDeleteOption(optionMenu.option);
            }
            setOptionMenu(null);
          }}
        >
          <ListItemText
            primary={dictionary.delete}
            slotProps={{ primary: { color: 'error' } }}
          />
        </MenuItem>
      </Menu>
    </ListItem>
  );
}
