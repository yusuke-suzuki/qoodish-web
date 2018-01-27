import React, { Component } from 'react';
import Snackbar from 'material-ui/Snackbar';

export default class Toast extends Component {
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
