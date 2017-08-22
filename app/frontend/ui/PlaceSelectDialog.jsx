import React, { Component } from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import PlacesAutocomplete from 'react-places-autocomplete';

const autoCompleteStyles = {
  root: {
    paddingRight: 22
  },
  autocompleteContainer: {
    zIndex: 2
  }
};

class PlaceSelectDialog extends Component {
  constructor(props) {
    super(props);
    this.handlePlaceSelected = this.handlePlaceSelected.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.state = {
      placeInput: '',
      placeId: '',
      description: ''
    };
  }

  handleInputChange(input) {
    if (!input) {
      this.setState({
        placeId: '',
        description: ''
      });
    }
    this.setState({
      placeInput: input
    });
  }

  handlePlaceSelected(name, placeId) {
    this.setState({
      placeId: placeId,
      description: name,
      placeInput: name
    });
    let place = {
      placeId: placeId,
      description: name
    };
    this.props.onRequestClose();
    this.props.onPlaceSelected(place);
  }

  render() {
    const inputProps = {
      value: this.state.placeInput,
      onChange: this.handleInputChange
    };

    return (
      <Dialog
        open={this.props.dialogOpen}
        onRequestClose={this.props.onRequestClose}
      >
      　<DialogTitle>
          Select Place
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
          </DialogContentText>
          <PlacesAutocomplete
            inputProps={inputProps}
            onSelect={this.handlePlaceSelected}
            styles={autoCompleteStyles}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onRequestClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default PlaceSelectDialog;
