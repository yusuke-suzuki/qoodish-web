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

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

const handleInputChange = (input, props) => {
  if (props.loadingPlaces || !input) {
    return;
  }
  props.handleInputChange(input);
}

const handlePlaceSelected = (place, props) => {
  let params = {
    placeId: place.place_id,
    description: place.description
  };
  props.onClose();
  props.onPlaceSelected(params);
}

const PlaceDialogTitle = () => {
  return (
    <DialogTitle>
      <div style={styles.dialogTitle}>
        <PlaceIcon style={styles.placeIcon} />{I18n.t('select place')}
      </div>
    </DialogTitle>
  );
}

const PlaceAppBar = (props) => {
  return (
    <AppBar style={styles.appbar} color="primary">
      <Toolbar style={styles.toolbar}>
        <IconButton
          color="inherit"
          onClick={props.onClose}
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

const PlaceActions = (props) => {
  return (
    <DialogActions>
      <Button onClick={props.onClose}>{I18n.t('cancel')}</Button>
    </DialogActions>
  );
}

const PlaceSelectDialog = (props) => {
  return (
    <Dialog
      open={props.dialogOpen}
      onEnter={props.onEnter}
      onClose={props.onClose}
      fullWidth
      fullScreen={!props.large}
      TransitionComponent={Transition}
    >
      {props.large ? <PlaceDialogTitle {...props} /> : <PlaceAppBar />}
      <DialogContent
        style={
          props.large
            ? styles.dialogContentLarge
            : styles.dialogContentSmall
        }
      >
        <TextField
          label={I18n.t('search places')}
          onChange={(e) => handleInputChange(e.target.value, props)}
          fullWidth
          autoFocus
          placeholder={I18n.t('search places example')}
          helperText={I18n.t('search places help')}
          data-test="place-name-input"
        />
        <List>
          {props.places.map(place => (
            <ListItem
              button
              key={place.place_id}
              onClick={() => handlePlaceSelected(place, props)}
              data-test="place-list-item"
            >
              <ListItemAvatar>
                <Avatar>
                  <PlaceIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={place.description} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      {props.large && <PlaceActions {...props} />}
    </Dialog>
  );
}

export default PlaceSelectDialog;
