'use client';

import { ArrowDownward, ArrowUpward, Delete } from '@mui/icons-material';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import type { NodeKey } from 'lexical';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary';
import useChapterNodeActions from './useChapterNodeActions';

type Props = {
  nodeKey: NodeKey;
  anchorEl: HTMLElement | null;
  onClose: () => void;
};

function ChapterNodeMenu({ nodeKey, anchorEl, onClose }: Props) {
  const dictionary = useDictionary();
  const { moveUp, moveDown, remove } = useChapterNodeActions(nodeKey);

  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      <MenuItem
        onClick={() => {
          moveUp();
          onClose();
        }}
      >
        <ListItemIcon>
          <ArrowUpward fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={dictionary['move up']} />
      </MenuItem>
      <MenuItem
        onClick={() => {
          moveDown();
          onClose();
        }}
      >
        <ListItemIcon>
          <ArrowDownward fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={dictionary['move down']} />
      </MenuItem>
      <MenuItem
        onClick={() => {
          remove();
          onClose();
        }}
      >
        <ListItemIcon>
          <Delete fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={dictionary.delete} />
      </MenuItem>
    </Menu>
  );
}

export default memo(ChapterNodeMenu);
