import React, { Component } from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';
import { FormControlLabel } from 'material-ui/Form';

const styles = {
  deleteButton: {
    color: 'white',
    backgroundColor: 'red'
  }
};

class DeleteAccountDialog extends Component {
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
    }, () => {
      this.props.handleRequestDialogClose();
    });
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
        onClose={this.handleRequestDialogClose}
        fullWidth
      >
        <DialogTitle>
          Are you sure you want to DELETE your account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            When you delete the account, it also deletes ALL of the content that
            you have created. This cannot be undone.
          </DialogContentText>
          <br />
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.check}
                onChange={this.handleCheckChange}
              />
            }
            label="I understand this cannot be undone."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleRequestDialogClose}>Cancel</Button>
          <Button
            variant="raised"
            onClick={() => {
              this.props.handleDeleteButtonClick(this.props.currentUser);
              this.handleRequestDialogClose();
            }}
            disabled={this.state.disabled}
            style={this.state.disabled ? {} : styles.deleteButton}
          >
            DELETE
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default DeleteAccountDialog;
