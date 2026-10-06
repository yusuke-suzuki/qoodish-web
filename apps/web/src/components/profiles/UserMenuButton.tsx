'use client';

import { MoreVert, ReportProblem } from '@mui/icons-material';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import { memo, useRef, useState } from 'react';
import type { Profile } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import BlockMenuItem from '../common/BlockMenuItem.tsx';
import MuteMenuItem from '../common/MuteMenuItem.tsx';

type Props = {
  profile: Profile;
  authenticated: boolean;
  disabled: boolean;
  onReportClick: () => void;
  onBlockClick: () => void;
  onUnblockClick: () => void;
  onMuteClick: () => void;
  onUnmuteClick: () => void;
};

function UserMenuButton({
  profile,
  authenticated,
  disabled,
  onReportClick,
  onBlockClick,
  onUnblockClick,
  onMuteClick,
  onUnmuteClick
}: Props) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const dictionary = useDictionary();

  const select = (handler: () => void) => () => {
    setAnchorEl(null);

    handler();
  };

  return (
    <>
      <IconButton
        ref={buttonRef}
        onClick={() => setAnchorEl(buttonRef.current)}
        disabled={disabled}
        title={dictionary.more}
        aria-label={dictionary.more}
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {authenticated && (
          <MuteMenuItem
            muting={Boolean(profile.muting)}
            onClick={select(profile.muting ? onUnmuteClick : onMuteClick)}
          />
        )}
        {authenticated && (
          <BlockMenuItem
            blocking={Boolean(profile.blocking)}
            onClick={select(profile.blocking ? onUnblockClick : onBlockClick)}
          />
        )}
        <MenuItem onClick={select(onReportClick)}>
          <ListItemIcon>
            <ReportProblem fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={dictionary['report content']} />
        </MenuItem>
      </Menu>
    </>
  );
}

export default memo(UserMenuButton);
