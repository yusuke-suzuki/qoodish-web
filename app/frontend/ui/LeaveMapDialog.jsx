import React, { Component } from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';

class LeaveMapDialog extends Component {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestDialogClose}
        fullWidth
      >
        <DialogTitle>Are you sure you want to unfollow this map?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The reports you've written will not be deleted by unfollowing the
            map.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleCancelButtonClick}>Cancel</Button>
          <Button
            variant="raised"
            onClick={this.props.handleLeaveButtonClick}
            color="primary"
          >
            UNFOLLOW
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default LeaveMapDialog;
