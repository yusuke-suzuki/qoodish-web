import React, { Component } from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';
import { FormControlLabel } from 'material-ui/Form';

class DeleteReviewDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      check: false,
      disabled: true
    };
    this.handleCheckChange = this.handleCheckChange.bind(this);
    this.handleRequestDialogClose = this.handleRequestDialogClose.bind(this);
  }

  handleRequestDialogClose() {
    this.setState({
      check: false,
      disabled: true
    });
    this.props.handleRequestDialogClose();
  }

  handleCheckChange() {
    this.setState({
      check: !this.state.check,
      disabled: !this.state.disabled
    });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onRequestClose={this.handleRequestDialogClose}
        fullWidth
      >
      　<DialogTitle>
          Are you sure you want to DELETE this report?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This cannot be undone.
          </DialogContentText>
          <br/>
          <br/>
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.check}
                onChange={this.handleCheckChange}
              />
            }
            label='I understand this cannot be undone.'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleRequestDialogClose}>
            Cancel
          </Button>
          <Button raised onClick={() => this.props.handleDeleteButtonClick(this.props.currentReview)} color='primary' disabled={this.state.disabled}>
            DELETE
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default DeleteReviewDialog;
