import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

export default class Toast extends React.Component {
  render() {
    return (
      <div>
        <Snackbar
          open={this.props.toastOpen}
          message={this.props.toastMessage}
          autoHideDuration={4000}
          onClose={this.props.handleRequestClose}
        />
      </div>
    );
  }
}
