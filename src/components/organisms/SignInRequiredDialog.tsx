import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import Fade from '@material-ui/core/Fade';

import LoginButtons from './LoginButtons';
import I18n from '../../utils/I18n';
import closeSignInRequiredDialog from '../../actions/closeSignInRequiredDialog';
import { useTheme } from '@material-ui/core';

const styles = {
  dialogContent: {
    paddingBottom: 0
  }
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SignInRequiredDialog = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const dialogOpen = useMappedState(
    useCallback(state => state.shared.signInRequiredDialogOpen, [])
  );
  const onClose = useCallback(() => {
    dispatch(closeSignInRequiredDialog());
  }, [dispatch]);

  return (
    <Dialog
      open={dialogOpen}
      onClose={onClose}
      fullWidth
      fullScreen={!smUp}
      TransitionComponent={smUp ? Fade : Transition}
    >
      <DialogTitle>{I18n.t('this action requires sign in')}</DialogTitle>
      <DialogContent style={styles.dialogContent}>
        <LoginButtons />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{I18n.t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(SignInRequiredDialog);
