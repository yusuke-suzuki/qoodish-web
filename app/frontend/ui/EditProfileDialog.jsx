import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import IconButton from '@material-ui/core/IconButton';

const styles = {
  avatarContainer: {
    marginBottom: 20
  },
  profileAvatar: {
    width: 80,
    height: 80
  },
  imageInput: {
    display: 'none'
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class EditProfileDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      imageUrl: '',
      editImage: false,
      errorName: undefined,
      disabled: true
    };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
    this.validate = this.validate.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUser) {
      this.setState({
        name: nextProps.currentUser.name,
        imageUrl: nextProps.currentUser.image_url
      });
    }
  }

  clearState() {
    this.setState({
      name: '',
      imageUrl: '',
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

  handleAddImageClick(e) {
    document.getElementById('profile-image-input').click();
  }

  handleImageChange(e) {
    let reader = new FileReader();
    let file = e.target.files[0];
    if (!file.type.match(/image\/*/)) {
      return;
    }

    reader.onloadend = () => {
      let dataUrl = reader.result;
      this.setState({
        imageUrl: dataUrl,
        editImage: true
      });
    };

    reader.readAsDataURL(file);
  }

  handleSaveButtonClick() {
    let params = {
      display_name: this.state.name
    };
    if (this.state.editImage) {
      params.image_url = this.state.imageUrl;
    }
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
          <div style={styles.avatarContainer}>
            <Avatar
              src={this.state.imageUrl}
              style={styles.profileAvatar}
            >
              <img src={this.state.imageUrl} style={styles.image} />
              <IconButton onClick={this.handleAddImageClick}>
                <PhotoCameraIcon />
              </IconButton>
            </Avatar>
          </div>
          <input
            type="file"
            accept="image/*"
            id="profile-image-input"
            onChange={this.handleImageChange}
            style={styles.imageInput}
          />
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
