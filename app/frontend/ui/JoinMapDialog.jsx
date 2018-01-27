import React, { Component } from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';

class JoinMapDialog extends Component {
  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestDialogClose}
        fullWidth
      >
      　<DialogTitle>
          Are you sure you want to follow this map?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You can receive events by following the map.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleCancelButtonClick}>
            Cancel
          </Button>
          <Button raised onClick={this.props.handleJoinButtonClick} color='primary'>
            FOLLOW
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default JoinMapDialog;
