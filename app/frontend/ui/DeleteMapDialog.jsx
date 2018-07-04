import React, { Component } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';

class DeleteMapDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      check: false,
      disabled: true
    };
    this.handleCheckChange = this.handleCheckChange.bind(this);
    this.handleRequestDialogClose = this.handleRequestDialogClose.bind(this);
  }

  handleCheckChange() {
    this.setState({
      check: !this.state.check,
      disabled: !this.state.disabled
    });
  }

  handleRequestDialogClose() {
    this.setState({
      check: false,
      disabled: true
    }, () => {
      this.props.handleRequestDialogClose();
    });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.handleRequestDialogClose}
        fullWidth
      >
        <DialogTitle>Are you sure you want to DELETE this map?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            When you delete a map, it also deletes all of the content that has
            been registered in the map. This cannot be undone.
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
              this.props.handleDeleteButtonClick();
              this.handleRequestDialogClose();
            }}
            color="primary"
            disabled={this.state.disabled}
          >
            DELETE
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default DeleteMapDialog;
