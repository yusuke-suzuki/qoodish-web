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
            raised
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
