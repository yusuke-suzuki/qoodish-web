import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../containers/I18n';
import { Link } from 'react-router-dom';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import FollowMapButtonContainer from '../containers/FollowMapButtonContainer';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

const styles = {
  toolbar: {
    paddingLeft: 8
  },
  listItem: {
    paddingRight: 100
  },
  listItemSecondaryAction: {
    paddingRight: 16
  }
};

const FollowingMaps = props => {
  return props.maps.map(map => (
    <ListItem
      button
      component={Link}
      to={`/maps/${map.id}`}
      key={map.id}
      onClick={props.onClose}
      style={styles.listItem}
    >
      <ListItemAvatar>
        <Avatar alt={map.name} src={map.thumbnail_url} />
      </ListItemAvatar>
      <ListItemText
        primary={map.name}
        primaryTypographyProps={{ noWrap: true}}
      />
      <ListItemSecondaryAction style={styles.listItemSecondaryAction} >
        <FollowMapButtonContainer currentMap={map} />
      </ListItemSecondaryAction>
    </ListItem>
  ));
};

const FollowingMapsDialog = props => {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth
      fullScreen={!props.large}
      TransitionComponent={Transition}
    >
      <Toolbar style={styles.toolbar}>
        <IconButton
          color="inherit"
          onClick={props.onClose}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" noWrap>
          {I18n.t('following')}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <FollowingMaps {...props} />
      </List>
    </Dialog>
  );
};

export default FollowingMapsDialog;
