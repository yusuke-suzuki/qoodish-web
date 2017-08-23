import React, { Component } from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import { FormControlLabel } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import Typography from 'material-ui/Typography';
import PlacesAutocomplete from 'react-places-autocomplete';
import Button from 'material-ui/Button';

const autoCompleteStyles = {
  root: {
    paddingRight: 22
  },
  autocompleteContainer: {
    zIndex: 2
  }
};

class EditMapDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapId: '',
      name: '',
      description: '',
      baseId: '',
      baseName: '',
      private: false,
      invitable: false,
      shared: false,
      errorMapName: null,
      errorDescription: null,
      disabled: true,
      placeInput: ''
    };
    this.handleMapNameChange = this.handleMapNameChange.bind(this);
    this.handleMapDescriptionChange = this.handleMapDescriptionChange.bind(this);
    this.handleMapBaseChange = this.handleMapBaseChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
    this.handlePrivateFlugChange = this.handlePrivateFlugChange.bind(this);
    this.handleInvitableFlugChange = this.handleInvitableFlugChange.bind(this);
    this.handleSharedFlugChange = this.handleSharedFlugChange.bind(this);
    this.validate = this.validate.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    let currentMap = nextProps.currentMap;
    if (nextProps.currentMap) {
      this.setState({
        mapId: currentMap.id,
        name: currentMap.name,
        description: currentMap.description,
        baseId: currentMap.base.place_id,
        baseName: currentMap.base.name,
        private: currentMap.private,
        invitable: currentMap.invitable,
        shared: currentMap.shared,
        disabled: false
      });
    }
    if (!nextProps.dialogOpen) {
      this.clearState();
    }
  }

  clearState() {
    this.setState({
      mapId: '',
      name: '',
      description: '',
      baseId: '',
      baseName: '',
      private: false,
      invitable: false,
      shared: false,
      errorMapName: null,
      errorDescription: null,
      disabled: true,
      placeInput: ''
    });
  }

  handleMapNameChange(e) {
    let name = e.target.value;
    let errorText;
    if (name) {
      if (name.length > 30) {
        errorText = 'The maximum number of characters is 30';
      } else {
        errorText = null;
      }
    } else {
      errorText = 'Map name is required';
    }

    this.setState({
      name: name,
      errorMapName: errorText
    }, () => {
      this.validate();
    });
  }

  handleMapDescriptionChange(e) {
    let description = e.target.value;
    let errorText;
    if (description) {
      if (description.length > 140) {
        errorText = 'The maximum number of characters is 140';
      } else {
        errorText = null;
      }
    } else {
      errorText = 'Description is required';
    }

    this.setState({
      description: description,
      errorDescription: errorText
    }, () => {
      this.validate();
    });
  }

  handleInputChange(input) {
    if (!input) {
      this.setState({
        baseId: '',
        baseName: ''
      });
    }
    this.setState({
      placeInput: input
    });
  }

  handleMapBaseChange(name, placeId) {
    this.setState({
      baseId: placeId,
      baseName: name,
      placeInput: name
    });
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
      base_id: this.state.baseId,
      base_name: this.state.baseName,
      private: this.state.private,
      invitable: this.state.invitable,
      shared: this.state.shared
    };
    this.props.handleSaveButtonClick(params);
  }

  validate() {
    let disabled;
    if (this.state.name && this.state.description && !this.state.errorMapName && !this.state.errorDescription) {
      disabled = false;
    } else {
      disabled = true;
    }
    this.setState({
      disabled: disabled
    });
  }

  render() {
    const inputProps = {
      value: this.state.placeInput,
      onChange: this.handleInputChange,
      placeholder: 'Search places...'
    };

    return (
      <Dialog
        open={this.props.dialogOpen}
        onRequestClose={this.props.handleRequestDialogClose}
        ignoreBackdropClick
        ignoreEscapeKeyUp
      >
      　<DialogTitle>
          {this.props.currentMap ? 'Edit Map' : 'Create New Map'}
        </DialogTitle>
        <DialogContent>
          {this.props.currentMap ? this.renderMapNameTextEdit() : this.renderMapNameTextCreate()}
          <br/>
          {this.props.currentMap ? this.renderDescriptionTextEdit() : this.renderDescriptionTextCreate()}
          <br/>
          <br/>
          <Typography type='subheading' gutterBottom color='secondary'>
            The center of this map (Optional)
          </Typography>
          <PlacesAutocomplete
            inputProps={inputProps}
            onSelect={this.handleMapBaseChange}
            styles={autoCompleteStyles}
          />
          <br/>
          <FormControlLabel
            control={
              <Switch
                checked={this.state.private}
                onChange={this.handlePrivateFlugChange}
              />
            }
            label='Set this map to private.'
          />
          <br/>
          <FormControlLabel
            control={
              <Switch
                checked={this.state.invitable}
                onChange={this.handleInvitableFlugChange}
              />
            }
            label='Allow collaborators to invite other users.'
          />
          <br/>
          <FormControlLabel
            control={
              <Switch
                checked={this.state.shared}
                onChange={this.handleSharedFlugChange}
              />
            }
            label='Allow collaborators to add spots.'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleRequestDialogClose}>
            Cancel
          </Button>
          <Button raised onClick={this.handleSaveButtonClick} color='primary' disabled={this.state.disabled}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }


  renderMapNameTextEdit() {
    return (
      <TextField
        label='Map name'
        onChange={this.handleMapNameChange}
        error={this.state.errorMapName ? true : false}
        helperText={this.state.errorMapName}
        fullWidth
        autoFocus
        value={this.state.name}
      />
    );
  }

  renderMapNameTextCreate() {
    return (
      <TextField
        label='Map name'
        onChange={this.handleMapNameChange}
        error={this.state.errorMapName ? true : false}
        helperText={this.state.errorMapName}
        fullWidth
        autoFocus
      />
    );
  }

  renderDescriptionTextEdit() {
    return (
      <TextField
        label='Map description'
        onChange={this.handleMapDescriptionChange}
        error={this.state.errorDescription ? true : false}
        helperText={this.state.errorDescription}
        fullWidth
        value={this.state.description}
      />
    );
  }

  renderDescriptionTextCreate() {
    return (
      <TextField
        label='Map description'
        onChange={this.handleMapDescriptionChange}
        error={this.state.errorDescription ? true : false}
        helperText={this.state.errorDescription}
        fullWidth
      />
    );
  }
}

export default EditMapDialog;
