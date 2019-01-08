import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

const Toast = (props) => {
  return (
    <div>
      <Snackbar
        open={props.toastOpen}
        message={props.toastMessage}
        autoHideDuration={props.toastDuration}
        onClose={props.handleRequestClose}
      />
    </div>
  );
}

export default Toast;
