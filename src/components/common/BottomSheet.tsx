'use client';

import { Box, SwipeableDrawer, type SwipeableDrawerProps } from '@mui/material';
import { type ReactNode, memo } from 'react';
import DrawerPuller from './DrawerPuller';

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: string;
  invisibleBackdrop?: boolean;
  sx?: SwipeableDrawerProps['sx'];
  onExited?: () => void;
};

function BottomSheet({
  open,
  onOpen,
  onClose,
  children,
  maxHeight = '75svh',
  invisibleBackdrop,
  sx,
  onExited
}: Props) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      variant="temporary"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      disableSwipeToOpen
      sx={sx}
      slotProps={{
        backdrop: invisibleBackdrop ? { invisible: true } : undefined,
        paper: {
          sx: {
            maxHeight,
            display: 'flex',
            flexDirection: 'column'
          }
        },
        transition: { onExited }
      }}
    >
      <DrawerPuller />

      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>
    </SwipeableDrawer>
  );
}

export default memo(BottomSheet);
