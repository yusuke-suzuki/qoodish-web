import React, { Component } from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import PlacesAutocomplete from 'react-places-autocomplete';
import PlaceIcon from 'material-ui-icons/Place';

const styles = {
  titleText: {
    marginLeft: 30
  },
  dialogContent: {
    overflow: 'initial'
  },
  placeIcon: {
    marginTop: -2,
    marginRight: 10,
    position: 'absolute'
  }
};

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
      onChange: this.handleInputChange,
      placeholder: 'Search places...',
      autoFocus: true
    };

    return (
      <Dialog
        open={this.props.dialogOpen}
        onRequestClose={this.props.onRequestClose}
      >
      　<DialogTitle>
          <PlaceIcon style={styles.placeIcon} /><div style={styles.titleText}>Select Place</div>
        </DialogTitle>
        <DialogContent style={styles.dialogContent}>
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
