import React, { Component } from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';

class LeaveMapDialog extends Component {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onRequestClose={this.props.handleRequestDialogClose}
      >
      　<DialogTitle>
          Are you sure you want to leave this map?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            The reports you've written will not be deleted by leaving the map.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleCancelButtonClick}>
            Cancel
          </Button>
          <Button raised onClick={this.props.handleLeaveButtonClick} color='primary'>
            Leave
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default LeaveMapDialog;
