import { memo, useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import { makeStyles } from '@material-ui/core/styles';
import { Backdrop, CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 10000,
    color: '#fff'
  }
}));

export default memo(function BlockUi() {
  const classes = useStyles();

  const blocking = useMappedState(
    useCallback(state => state.shared.blocking, [])
  );

  return (
    <Backdrop className={classes.backdrop} open={blocking}>
      <CircularProgress color="primary" />
    </Backdrop>
  );
});
