import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import PlaceIcon from '@material-ui/icons/Place';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import I18n from '../containers/I18n';

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

class PlaceSelectDialog extends React.PureComponent {
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
          <TextField
            label={I18n.t('search places')}
            onChange={this.handleInputChange}
            fullWidth
            autoFocus
            placeholder={I18n.t('search places example')}
            helperText={I18n.t('search places help')}
            margin="normal"
            data-test="place-name-input"
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
          <PlaceIcon style={styles.placeIcon} />{I18n.t('select place')}
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
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" style={styles.flex}>
            {I18n.t('select place')}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  renderAction() {
    return (
      <DialogActions>
        <Button onClick={this.props.onClose}>{I18n.t('cancel')}</Button>
      </DialogActions>
    );
  }

  renderPlaces() {
    return this.props.places.map(place => (
      <ListItem
        button
        key={place.place_id}
        onClick={() => this.handlePlaceSelected(place)}
        data-test="place-list-item"
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
