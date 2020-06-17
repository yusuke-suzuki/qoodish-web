import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import Snackbar from '@material-ui/core/Snackbar';
import closeToast from '../../actions/closeToast';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

const Toast = () => {
  const mapState = useCallback(
    state => ({
      toastOpen: state.shared.toastOpen,
      toastMessage: state.shared.toastMessage,
      toastDuration: state.shared.toastDuration
    }),
    []
  );
  const { toastOpen, toastMessage, toastDuration } = useMappedState(mapState);
  const dispatch = useDispatch();
  const handleRequestClose = useCallback(() => {
    dispatch(closeToast());
  }, [dispatch]);

  return (
    <div>
      <Snackbar
        open={toastOpen}
        message={toastMessage}
        autoHideDuration={toastDuration}
        onClose={handleRequestClose}
        action={
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleRequestClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  );
};

export default React.memo(Toast);
