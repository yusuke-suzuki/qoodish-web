import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

class LeaveMapDialog extends React.Component {
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
