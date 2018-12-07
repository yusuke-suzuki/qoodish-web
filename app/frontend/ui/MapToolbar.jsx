import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import LockIcon from '@material-ui/icons/Lock';
import Tooltip from '@material-ui/core/Tooltip';
import I18n from '../containers/I18n';

import loadable from '@loadable/component';
const MapShareMenuContainer = loadable(() => import(/* webpackChunkName: "map_share_menu" */ '../containers/MapShareMenuContainer'));
const MapVertMenuContainer = loadable(() => import(/* webpackChunkName: "map_vert_menu" */ '../containers/MapVertMenuContainer'));
const AppMenuButtonContainer = loadable(() => import(/* webpackChunkName: "app_menu" */ '../containers/AppMenuButtonContainer'));

const styles = {
  leftButton: {
    marginLeft: 8,
    color: 'white'
  },
  mapToolbarLarge: {
    paddingLeft: 10
  },
  mapToolbarSmall: {
  },
  toolbarActions: {
    marginLeft: 'auto',
    display: 'flex',
  },
  mapMenuIcon: {
    color: 'white'
  },
  mapName: {
    cursor: 'pointer',
    marginLeft: 4
  },
  mapTypeIcon: {
    marginRight: 6
  }
};

const isInvitable = (map) => {
  return map && map.private && (map.editable || map.invitable);
};

const InviteButton = (props) => {
  return (
    <IconButton
      onClick={props.handleInviteButtonClick}
    >
      <PersonAddIcon style={styles.mapMenuIcon} />
    </IconButton>
  );
};

const PrivateIcon = () => {
  return (
    <Tooltip title={I18n.t('this map is private')}>
      <LockIcon color="inherit" style={styles.mapTypeIcon} fontSize="small" />
    </Tooltip>
  );
};

const MapName = (props) => {
  return (
    <Typography
      variant="h6"
      color="inherit"
      noWrap
      style={styles.mapName}
    >
      {props.currentMap.name}
    </Typography>
  );
};

const BackButton = (props) => {
  return (
    <IconButton
      color="inherit"
      onClick={props.handleBackButtonClick}
      style={props.large ? {} : styles.leftButton}
    >
      <ArrowBackIcon />
    </IconButton>
  );
}

const MapToolbar = (props) => {
  return (
    <Toolbar style={props.large ? styles.mapToolbarLarge : styles.mapToolbarSmall} disableGutters>
      {props.showBackButton && <BackButton {...props} />}
      {props.showMenuButton && <AppMenuButtonContainer />}
      {props.currentMap && props.currentMap.private && <PrivateIcon />}
      {props.showMapName && props.currentMap && <MapName {...props} />}
      <div style={styles.toolbarActions}>
        {isInvitable(props.currentMap) && <InviteButton {...props} />}
        <MapShareMenuContainer />
        <MapVertMenuContainer />
      </div>
    </Toolbar>
  );
};

export default MapToolbar;
