import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';

const styles = {
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class EditProfileDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      shared: false,
      errorName: undefined,
      disabled: true
    };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
    this.validate = this.validate.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUser) {
      this.setState({
        name: nextProps.currentUser.name
      });
    }
  }

  clearState() {
    this.setState({
      name: '',
      errorName: undefined,
      disabled: true
    });
  }

  handleNameChange(e) {
    let name = e.target.value;
    let errorText;
    if (name) {
      if (name.length > 30) {
        errorText = 'The maximum number of characters is 30';
      } else {
        errorText = null;
      }
    } else {
      errorText = 'Name is required';
    }

    this.setState(
      {
        name: name,
        errorName: errorText
      },
      () => {
        this.validate();
      }
    );
  }

  handleSaveButtonClick() {
    let params = {
      display_name: this.state.name
    };
    this.props.handleSaveButtonClick(params);
  }

  validate() {
    let disabled;
    if (
      this.state.name &&
      !this.state.errorName
    ) {
      disabled = false;
    } else {
      disabled = true;
    }
    this.setState({
      disabled: disabled
    });
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onClose={this.props.handleRequestDialogClose}
        disableBackdropClick
        disableEscapeKeyDown
        fullWidth
        fullScreen={!this.props.large}
        TransitionComponent={Transition}
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {this.renderNameText()}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleRequestDialogClose}>Cancel</Button>
          <Button
            variant="raised"
            onClick={this.handleSaveButtonClick}
            color="primary"
            disabled={this.state.disabled}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderNameText() {
    return (
      <TextField
        label="Name"
        onChange={this.handleNameChange}
        error={this.state.errorName ? true : false}
        helperText={this.state.errorName}
        fullWidth
        autoFocus
        value={this.state.name}
      />
    );
  }
}

export default EditProfileDialog;
