import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import LockIcon from '@material-ui/icons/Lock';
import Tooltip from '@material-ui/core/Tooltip';
import I18n from '../../utils/I18n';

import loadable from '@loadable/component';
const MapShareMenu = loadable(() =>
  import(/* webpackChunkName: "map_share_menu" */ './MapShareMenu')
);
const MapVertMenu = loadable(() =>
  import(/* webpackChunkName: "map_vert_menu" */ './MapVertMenu')
);
const AppMenuButton = loadable(() =>
  import(/* webpackChunkName: "app_menu" */ './AppMenuButton')
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

const MapToolbar = props => {
  const large = useMediaQuery('(min-width: 600px)');

  const mapState = useCallback(
    state => ({
      previousLocation: state.shared.previousLocation,
      map: state.mapSummary.currentMap,
      mapSummaryOpen: state.mapDetail.mapSummaryOpen,
      history: state.shared.history
    }),
    []
  );
  const { previousLocation, map, mapSummaryOpen, history } = useMappedState(
    mapState
  );

  const handleBackButtonClick = useCallback(() => {
    if (large) {
      if (previousLocation) {
        history.goBack();
      } else {
        history.push('/');
      }
    } else {
      if (mapSummaryOpen) {
        history.goBack();
      } else {
        if (previousLocation) {
          history.goBack();
        } else {
          history.push('/');
        }
      }
    }
  });

  return (
    <Toolbar
      style={large ? styles.mapToolbarLarge : styles.mapToolbarSmall}
      disableGutters
    >
      {props.showBackButton && (
        <IconButton
          color="inherit"
          onClick={handleBackButtonClick}
          style={large ? {} : styles.leftButton}
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      {props.showMenuButton && <AppMenuButton />}
      {map && map.private && (
        <Tooltip title={I18n.t('this map is private')}>
          <LockIcon
            color="inherit"
            style={styles.mapTypeIcon}
            fontSize="small"
          />
        </Tooltip>
      )}
      {props.showMapName && map && (
        <Typography variant="h6" color="inherit" noWrap style={styles.mapName}>
          {map.name}
        </Typography>
      )}
      <div style={styles.toolbarActions}>
        <MapShareMenu />
        <MapVertMenu />
      </div>
    </Toolbar>
  );
};

export default React.memo(MapToolbar);
