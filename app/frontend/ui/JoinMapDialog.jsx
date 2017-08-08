import React, { Component } from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';

class JoinMapDialog extends Component {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onRequestClose={this.props.handleRequestDialogClose}
      >
      　<DialogTitle>
          Are you sure you want to join in this map?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can post reports on the map when you comes to the collaborator of the map.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleCancelButtonClick}>
            Cancel
          </Button>
          <Button raised onClick={this.props.handleJoinButtonClick} color='primary'>
            Join
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default JoinMapDialog;
