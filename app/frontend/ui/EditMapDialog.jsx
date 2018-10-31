import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import PlaceIcon from '@material-ui/icons/Place';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../containers/I18n';

const styles = {
  flex: {
    flex: 1
  },
  dialogContentLarge: {},
  dialogContentSmall: {
    paddingTop: 80
  },
  toolbar: {
    paddingLeft: 8,
    height: 56
  },
  mapCenterChip: {
    marginTop: 16,
    marginBottom: 16
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class EditMapDialog extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mapId: '',
      name: '',
      description: '',
      private: false,
      invitable: false,
      shared: false,
      errorMapName: null,
      errorDescription: null,
      disabled: true
    };
    this.handleMapNameChange = this.handleMapNameChange.bind(this);
    this.handleMapDescriptionChange = this.handleMapDescriptionChange.bind(
      this
    );
    this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
    this.handlePrivateFlugChange = this.handlePrivateFlugChange.bind(this);
    this.handleInvitableFlugChange = this.handleInvitableFlugChange.bind(this);
    this.handleSharedFlugChange = this.handleSharedFlugChange.bind(this);
    this.validate = this.validate.bind(this);
    this.clearState = this.clearState.bind(this);
    this.setCurrentMap = this.setCurrentMap.bind(this);
  }

  setCurrentMap() {
    if (this.props.currentMap) {
      this.setState({
        mapId: this.props.currentMap.id,
        name: this.props.currentMap.name,
        description: this.props.currentMap.description,
        private: this.props.currentMap.private,
        invitable: this.props.currentMap.invitable,
        shared: this.props.currentMap.shared,
        disabled: false
      });
    }
  }

  clearState() {
    this.setState({
      mapId: '',
      name: '',
      description: '',
      private: false,
      invitable: false,
      shared: false,
      errorMapName: null,
      errorDescription: null,
      disabled: true
    });
  }

  handleMapNameChange(e) {
    let name = e.target.value;
    let errorText;
    if (name) {
      if (name.length > 30) {
        errorText = I18n.t('max characters 30');
      } else {
        errorText = null;
      }
    } else {
      errorText = I18n.t('map name is required');
    }

    this.setState(
      {
        name: name,
        errorMapName: errorText
      },
      () => {
        this.validate();
      }
    );
  }

  handleMapDescriptionChange(e) {
    let description = e.target.value;
    let errorText;
    if (description) {
      if (description.length > 200) {
        errorText = I18n.t('max characters 200');
      } else {
        errorText = null;
      }
    } else {
      errorText = I18n.t('description is required');
    }

    this.setState(
      {
        description: description,
        errorDescription: errorText
      },
      () => {
        this.validate();
      }
    );
  }

  handlePrivateFlugChange(e, checked) {
    this.setState({
      private: checked
    });
  }

  handleInvitableFlugChange(e, checked) {
    this.setState({
      invitable: checked
    });
  }

  handleSharedFlugChange(e, checked) {
    this.setState({
      shared: checked
    });
  }

  handleSaveButtonClick() {
    let params = {
      map_id: this.state.mapId,
      name: this.state.name,
      description: this.state.description,
      base_id: this.props.selectedBase ? this.props.selectedBase.placeId : '',
      base_name: this.props.selectedBase ? this.props.selectedBase.description : '',
      private: this.state.private,
      invitable: this.state.invitable,
      shared: this.state.shared
    };
    this.props.handleSaveButtonClick(params);
  }

  validate() {
    let disabled;
    if (
      this.state.name &&
      this.state.description &&
      !this.state.errorMapName &&
      !this.state.errorDescription
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
        onEnter={this.setCurrentMap}
        onExit={this.clearState}
        disableBackdropClick
        disableEscapeKeyDown
        fullWidth
        fullScreen={!this.props.large}
        TransitionComponent={Transition}
      >
        {this.props.large ? this.renderDialogTitle() : this.renderAppBar()}
        <DialogContent
          style={
            this.props.large
              ? styles.dialogContentLarge
              : styles.dialogContentSmall
          }
        >
          {this.renderMapNameText()}
          {this.renderDescriptionText()}
          <Chip
            avatar={
              <Avatar>
                <PlaceIcon />
              </Avatar>
            }
            label={this.props.selectedBase ? this.props.selectedBase.description : I18n.t('center of map')}
            onClick={this.props.handleMapBaseClick}
            style={styles.mapCenterChip}
            clickable
          />
          <br />
          <FormControlLabel
            control={
              <Switch
                checked={this.state.private}
                onChange={this.handlePrivateFlugChange}
              />
            }
            label={I18n.t('set this map to private')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={this.state.invitable}
                onChange={this.handleInvitableFlugChange}
              />
            }
            label={I18n.t('allow followers to invite')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={this.state.shared}
                onChange={this.handleSharedFlugChange}
              />
            }
            label={I18n.t('allow followers to post')}
          />
        </DialogContent>
        {this.props.large && this.renderDialogActions()}
      </Dialog>
    );
  }

  renderDialogTitle() {
    return (
      <DialogTitle>
        {this.props.currentMap ? I18n.t('edit map') : I18n.t('create new map')}
      </DialogTitle>
    );
  }

  renderAppBar() {
    return (
      <AppBar color="primary">
        <Toolbar style={styles.toolbar}>
          <IconButton
            color="inherit"
            onClick={this.props.handleRequestDialogClose}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" style={styles.flex}>
            {this.props.currentMap ? I18n.t('edit map') : I18n.t('create new map')}
          </Typography>
          <Button
            variant="contained"
            onClick={this.handleSaveButtonClick}
            color="secondary"
            disabled={this.state.disabled}
          >
            {I18n.t('save')}
          </Button>
        </Toolbar>
      </AppBar>
    );
  }

  renderDialogActions() {
    return (
      <DialogActions>
        <Button onClick={this.props.handleRequestDialogClose}>
          {I18n.t('cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={this.handleSaveButtonClick}
          color="primary"
          disabled={this.state.disabled}
        >
          {I18n.t('save')}
        </Button>
      </DialogActions>
    );
  }

  renderMapNameText() {
    return (
      <TextField
        label={I18n.t('map name')}
        onChange={this.handleMapNameChange}
        error={this.state.errorMapName ? true : false}
        helperText={this.state.errorMapName}
        fullWidth
        autoFocus
        value={this.state.name}
      />
    );
  }

  renderDescriptionText() {
    return (
      <TextField
        label={I18n.t('description')}
        onChange={this.handleMapDescriptionChange}
        error={this.state.errorDescription ? true : false}
        helperText={this.state.errorDescription}
        fullWidth
        value={this.state.description}
        margin="normal"
      />
    );
  }
}

export default EditMapDialog;
