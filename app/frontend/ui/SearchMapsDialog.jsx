import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import I18n from '../containers/I18n';
import { Link } from 'react-router-dom';

const styles = {
  toolbar: {
    paddingLeft: 8,
    height: 56
  }
};

const Maps = props => {
  return props.pickedMaps.map(map => (
    <ListItem
      button
      component={Link}
      to={`/maps/${map.id}`}
      key={map.id}
      onClick={props.handleRequestClose}
    >
      <ListItemAvatar>
        <Avatar alt={map.name} src={map.thumbnail_url} />
      </ListItemAvatar>
      <ListItemText primary={map.name} primaryTypographyProps={{ noWrap: true}} />
    </ListItem>
  ));
};

const handleInputChange = (input, props) => {
  if (props.loadingMaps || !input) {
    return;
  }
  props.handleInputChange(input);
};

const SearchForm = props => {
  return (
    <TextField
      onChange={(e) => handleInputChange(e.target.value, props)}
      fullWidth
      autoFocus
      type="search"
      placeholder={I18n.t("search map")}
      InputProps={{
        disableUnderline: true
      }}
      inputProps={{
        style: { padding: 0 }
      }}
    />
  );
};

const SearchAppBar = props => {
  return (
    <AppBar color="inherit">
      <Toolbar style={styles.toolbar}>
        <IconButton
          color="inherit"
          onClick={props.handleRequestClose}
        >
          <ArrowBackIcon />
        </IconButton>
        <SearchForm {...props} />
      </Toolbar>
    </AppBar>
  );
};

const SearchMapsDialog = props => {
  return (
    <Dialog
      open={props.dialogOpen}
      onClose={props.handleRequestClose}
      fullScreen
      PaperProps={{
        style: { background: "#f1f1f1" }
      }}
    >
      <SearchAppBar {...props} />
      <Paper>
        <List>
          <Maps {...props} />
        </List>
      </Paper>
    </Dialog>
  );
};

export default SearchMapsDialog;
