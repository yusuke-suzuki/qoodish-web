import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import LockIcon from '@material-ui/icons/Lock';
import Tooltip from '@material-ui/core/Tooltip';
import I18n from '../../../utils/I18n';

import loadable from '@loadable/component';
const MapShareMenu = loadable(() =>
  import(/* webpackChunkName: "map_share_menu" */ '../MapShareMenu')
);
const MapVertMenu = loadable(() =>
  import(/* webpackChunkName: "map_vert_menu" */ '../MapVertMenu')
);
const AppMenuButton = loadable(() =>
  import(/* webpackChunkName: "app_menu" */ '../AppMenuButton')
);

const styles = {
  leftButton: {
    color: 'white'
  },
  mapToolbarLarge: {
    paddingLeft: 10,
    paddingRight: 10
  },
  mapToolbarSmall: {
    paddingLeft: 8,
    paddingRight: 8
  },
  toolbarActions: {
    marginLeft: 'auto',
    display: 'flex'
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

const PrivateIcon = () => {
  return (
    <Tooltip title={I18n.t('this map is private')}>
      <LockIcon color="inherit" style={styles.mapTypeIcon} fontSize="small" />
    </Tooltip>
  );
};

const MapName = props => {
  return (
    <Typography variant="h6" color="inherit" noWrap style={styles.mapName}>
      {props.currentMap.name}
    </Typography>
  );
};

const BackButton = props => {
  return (
    <IconButton
      color="inherit"
      onClick={props.handleBackButtonClick}
      style={props.large ? {} : styles.leftButton}
    >
      <ArrowBackIcon />
    </IconButton>
  );
};

const MapToolbar = props => {
  return (
    <Toolbar
      style={props.large ? styles.mapToolbarLarge : styles.mapToolbarSmall}
      disableGutters
    >
      {props.showBackButton && <BackButton {...props} />}
      {props.showMenuButton && <AppMenuButton />}
      {props.currentMap && props.currentMap.private && <PrivateIcon />}
      {props.showMapName && props.currentMap && <MapName {...props} />}
      <div style={styles.toolbarActions}>
        <MapShareMenu />
        <MapVertMenu />
      </div>
    </Toolbar>
  );
};

export default MapToolbar;
