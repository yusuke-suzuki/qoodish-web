import React, { forwardRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
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
  makeStyles,
  createStyles
} from '@material-ui/core';
import I18n from '../../utils/I18n';
import closeSignInRequiredDialog from '../../actions/closeSignInRequiredDialog';

const LoginButtons = dynamic(() => import('./LoginButtons'), {
  ssr: false
});

const useStyles = makeStyles(() =>
  createStyles({
    dialogContent: {
      paddingBottom: 0
    }
  })
);

const Transition = forwardRef(function Transition(props: SlideProps, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SignInRequiredDialog = () => {
  const classes = useStyles();
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
      <DialogContent className={classes.dialogContent}>
        <LoginButtons />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{I18n.t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(SignInRequiredDialog);
