'use client';

import { Block } from '@mui/icons-material';
import { List, ListItem, ListItemText } from '@mui/material';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import AppDialog from './AppDialog.tsx';

type Props = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function BlockUserDialog({ open, loading, onClose, onConfirm }: Props) {
  const dictionary = useDictionary();

  const effects = [
    dictionary['block effect posts'],
    dictionary['block effect comments'],
    dictionary['block effect notifications'],
    dictionary['block effect bookmarks'],
    dictionary['block effect profile']
  ];

  return (
    <AppDialog
      open={open}
      title={dictionary['block account title']}
      onClose={onClose}
      disableClose={loading}
      confirmAction={{
        label: dictionary.block,
        onClick: onConfirm,
        color: 'error',
        startIcon: <Block />,
        loading
      }}
    >
      <List dense disablePadding>
        {effects.map((effect) => (
          <ListItem key={effect} disableGutters>
            <ListItemText
              primary={effect}
              slotProps={{ primary: { color: 'text.secondary' } }}
            />
          </ListItem>
        ))}
      </List>
    </AppDialog>
  );
}

export default memo(BlockUserDialog);
