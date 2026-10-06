'use client';

import { Close } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  type ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  type CSSProperties,
  type FormEvent,
  memo,
  type ReactNode,
  useId
} from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import SlideUpTransition from './SlideUpTransition.tsx';

// In full screen the form has to fill the dialog's height, or the content
// cannot grow and the action row is not pinned to the bottom.
const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 auto',
  minHeight: 0
};

export type ConfirmAction = {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  color?: ButtonProps['color'];
  startIcon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
};

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  /** Rendered in the top app bar when full screen, at the bottom right otherwise. */
  confirmAction?: ConfirmAction;
  /** Cancel button label. Not rendered in full screen; the close icon covers it. */
  cancelLabel?: string;
  /** Extra actions on the left of the action row. Stay at the bottom in full screen. */
  secondaryActions?: ReactNode;
  /** Take over the whole window below the sm breakpoint (600px). */
  fullScreenOnMobile?: boolean;
  maxWidth?: DialogProps['maxWidth'];
  dividers?: boolean;
  disableContentPadding?: boolean;
  disableClose?: boolean;
  /** Ignore backdrop clicks and Esc, so half-filled input is not lost. */
  disableQuickDismiss?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  formAction?: (formData: FormData) => void;
  onEnter?: () => void;
  onExited?: () => void;
};

function AppDialog({
  open,
  title,
  children,
  onClose,
  confirmAction,
  cancelLabel,
  secondaryActions,
  fullScreenOnMobile,
  maxWidth,
  dividers,
  disableContentPadding,
  disableClose,
  disableQuickDismiss,
  onSubmit,
  formAction,
  onEnter,
  onExited
}: Props) {
  const dictionary = useDictionary();
  const theme = useTheme();
  const titleId = useId();

  const compact = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = Boolean(fullScreenOnMobile) && compact;

  const confirmProps = confirmAction && {
    type: confirmAction.type ?? ('button' as const),
    onClick: confirmAction.onClick,
    startIcon: confirmAction.startIcon,
    disabled: confirmAction.disabled,
    loading: confirmAction.loading,
    children: confirmAction.label
  };

  const secondarySlot = secondaryActions && (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 'auto' }}>
      {secondaryActions}
    </Box>
  );

  const body = (
    <>
      {fullScreen ? (
        // Material Design 3 puts top app bars on a surface colour. The MUI
        // default (primary) is the Material 2 style, and white on amber would
        // also fall short of contrast requirements.
        <AppBar position="relative" color="transparent" elevation={0}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={onClose}
              disabled={disableClose}
              aria-label={dictionary.close}
            >
              <Close />
            </IconButton>
            <Typography
              id={titleId}
              variant="h6"
              component="h2"
              noWrap
              sx={{ ml: 2, flex: 1 }}
            >
              {title}
            </Typography>
            {confirmProps && (
              <Button
                color={confirmAction?.color ?? 'secondary'}
                {...confirmProps}
              />
            )}
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle id={titleId}>{title}</DialogTitle>
      )}

      <DialogContent
        dividers={dividers}
        sx={disableContentPadding ? { p: 0 } : undefined}
      >
        {children}
      </DialogContent>

      {fullScreen ? (
        secondarySlot && <DialogActions>{secondarySlot}</DialogActions>
      ) : (
        <DialogActions>
          {secondarySlot}
          <Button onClick={onClose} color="inherit" disabled={disableClose}>
            {cancelLabel ?? dictionary.cancel}
          </Button>
          {confirmProps && (
            <Button
              variant="contained"
              color={confirmAction?.color ?? 'secondary'}
              {...confirmProps}
            />
          )}
        </DialogActions>
      )}
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={disableClose || disableQuickDismiss ? undefined : onClose}
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      aria-labelledby={titleId}
      slots={fullScreen ? { transition: SlideUpTransition } : undefined}
      slotProps={{
        transition: { onEnter, onExited }
      }}
    >
      {onSubmit || formAction ? (
        <form onSubmit={onSubmit} action={formAction} style={formStyle}>
          {body}
        </form>
      ) : (
        body
      )}
    </Dialog>
  );
}

export default memo(AppDialog);
