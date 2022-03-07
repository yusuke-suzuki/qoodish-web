import React, { forwardRef, useCallback, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import {
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Slide,
  Fade,
  SlideProps,
  Box
} from '@material-ui/core';
import I18n from '../../utils/I18n';
import closeSignInRequiredDialog from '../../actions/closeSignInRequiredDialog';
import Link from 'next/link';
import { ExitToApp } from '@material-ui/icons';

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SignInRequiredDialog = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const dialogOpen = useMappedState(
    useCallback(state => state.shared.signInRequiredDialogOpen, [])
  );

  const handleClose = useCallback(() => {
    dispatch(closeSignInRequiredDialog());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      handleClose();
    };
  }, []);

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      fullWidth
      fullScreen={!smUp}
      TransitionComponent={smUp ? Fade : Transition}
    >
      <DialogTitle>{I18n.t('this action requires sign in')}</DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="center">
          <Link href="/login" passHref>
            <Button
              color="secondary"
              startIcon={<ExitToApp />}
              size="large"
              variant="contained"
            >
              {I18n.t('login')}
            </Button>
          </Link>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{I18n.t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(SignInRequiredDialog);
