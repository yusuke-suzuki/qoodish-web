import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import Snackbar from '@material-ui/core/Snackbar';
import closeToast from '../../actions/closeToast';

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
  });

  return (
    <div>
      <Snackbar
        open={toastOpen}
        message={toastMessage}
        autoHideDuration={toastDuration}
        onClose={handleRequestClose}
      />
    </div>
  );
};

export default React.memo(Toast);
