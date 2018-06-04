import React, { Component } from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import PlaceIcon from 'material-ui-icons/Place';
import TextField from 'material-ui/TextField';
import List, { ListItem, ListItemAvatar, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Slide from 'material-ui/transitions/Slide';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import CloseIcon from 'material-ui-icons/Close';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';

const styles = {
  appbar: {
    position: 'relative'
  },
  flex: {
    flex: 1
  },
  placeIcon: {
    marginRight: 10
  },
  dialogContentLarge: {
    paddingBottom: 0
  },
  dialogContentSmall: {
    paddingTop: 24
  },
  toolbar: {
    paddingLeft: 8,
    height: 56
  },
  dialogTitle: {
    display: 'flex'
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class PlaceSelectDialog extends Component {
  constructor(props) {
    super(props);
    this.handlePlaceSelected = this.handlePlaceSelected.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    let input = e.target.value;
    if (this.props.loadingPlaces || !input) {
      return;
    }
    this.props.handleInputChange(input);
  }

  handlePlaceSelected(place) {
    let params = {
      placeId: place.place_id,
      description: place.description
    };
    this.props.onClose();
    this.props.onPlaceSelected(params);
  }

  render() {
    return (
      <Dialog
        open={this.props.dialogOpen}
        onEnter={this.props.onEnter}
        onClose={this.props.onClose}
        fullWidth
        fullScreen={!this.props.large}
        transition={Transition}
      >
        {this.props.large ? this.renderDialogTitle() : this.renderAppBar()}
        <DialogContent
          style={
            this.props.large
              ? styles.dialogContentLarge
              : styles.dialogContentSmall
          }
        >
          <TextField
            label="Search places..."
            onChange={this.handleInputChange}
            fullWidth
            autoFocus
            placeholder="例: 「弘前  りんご公園」"
            helperText="「所在地  プレイス名」のように入力すると見つけやすくなります。"
          />
          <List>{this.renderPlaces()}</List>
        </DialogContent>
        {this.props.large && this.renderAction()}
      </Dialog>
    );
  }

  renderDialogTitle() {
    return (
      <DialogTitle>
        <div style={styles.dialogTitle}>
          <PlaceIcon style={styles.placeIcon} />Select Place
        </div>
      </DialogTitle>
    );
  }

  renderAppBar() {
    return (
      <AppBar style={styles.appbar} color="primary">
        <Toolbar style={styles.toolbar}>
          <IconButton
            color="inherit"
            onClick={this.props.onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="title" color="inherit" style={styles.flex}>
            Select Place
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  renderAction() {
    return (
      <DialogActions>
        <Button onClick={this.props.onClose}>Cancel</Button>
      </DialogActions>
    );
  }

  renderPlaces() {
    return this.props.places.map(place => (
      <ListItem
        button
        key={place.place_id}
        onClick={() => this.handlePlaceSelected(place)}
      >
        <ListItemAvatar>
          <Avatar>
            <PlaceIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={place.description} />
      </ListItem>
    ));
  }
}

export default PlaceSelectDialog;
