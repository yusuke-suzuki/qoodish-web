import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

const Toast = (props) => {
  return (
    <div>
      <Snackbar
        open={props.toastOpen}
        message={props.toastMessage}
        autoHideDuration={4000}
        onClose={props.handleRequestClose}
      />
    </div>
  );
}

export default Toast;
