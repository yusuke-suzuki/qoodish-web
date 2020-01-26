import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 10000,
    color: '#fff'
  }
}));

const BlockUi = () => {
  const classes = useStyles();

  const blocking = useMappedState(
    useCallback(state => state.shared.blocking, [])
  );

  return (
    <Backdrop className={classes.backdrop} open={blocking}>
      <CircularProgress color="primary" />
    </Backdrop>
  );
};

export default React.memo(BlockUi);
