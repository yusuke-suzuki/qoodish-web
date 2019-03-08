import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import LockIcon from '@material-ui/icons/Lock';
import Tooltip from '@material-ui/core/Tooltip';
import I18n from '../../utils/I18n';
import switchMap from '../../actions/switchMap';

import MapShareMenu from './MapShareMenu';
import MapVertMenu from './MapVertMenu';

const styles = {
  toolbarSmall: {
    height: 56,
    paddingLeft: 10,
    paddingRight: 10
  },
  backButtonLarge: {
    marginRight: 12
  },
  backButtonSmall: {
    marginRight: 8
  },
  toolbarActions: {
    marginLeft: 'auto',
    display: 'flex'
  },
  mapMenuIcon: {
    color: 'white'
  },
  mapName: {
    cursor: 'pointer'
  },
  mapTypeIcon: {
    marginRight: 6
  }
};

const MapToolbar = () => {
  const dispatch = useDispatch();
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
        dispatch(switchMap());
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
    <Toolbar style={large ? {} : styles.toolbarSmall}>
      <IconButton
        color="inherit"
        onClick={handleBackButtonClick}
        style={large ? styles.backButtonLarge : styles.backButtonSmall}
      >
        <ArrowBackIcon />
      </IconButton>
      {map && map.private && (
        <Tooltip title={I18n.t('this map is private')}>
          <LockIcon
            color="inherit"
            style={styles.mapTypeIcon}
            fontSize="small"
          />
        </Tooltip>
      )}
      {map && (
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
