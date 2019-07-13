import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import LockIcon from '@material-ui/icons/Lock';
import RefreshIcon from '@material-ui/icons/Refresh';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Tooltip from '@material-ui/core/Tooltip';
import I18n from '../../utils/I18n';
import switchMap from '../../actions/switchMap';

import MapShareMenu from './MapShareMenu';
import MapVertMenu from './MapVertMenu';
import MapLikeActions from './MapLikeActions';
import openInviteTargetDialog from '../../actions/openInviteTargetDialog';

const styles = {
  toolbarLarge: {
    paddingLeft: 12,
    paddingRight: 12
  },
  toolbarSmall: {
    height: 56,
    paddingLeft: 8,
    paddingRight: 8
  },
  backButtonLarge: {
    marginRight: 12
  },
  backButtonSmall: {},
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

const isInvitable = map => {
  return map && (map.editable || (map.following && map.invitable));
};

const MapToolbar = () => {
  const dispatch = useDispatch();
  const lgUp = useMediaQuery('(min-width: 1280px)');
  const smUp = useMediaQuery('(min-width: 600px)');

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
    if (lgUp) {
      if (previousLocation && !previousLocation.state) {
        history.goBack();
      } else {
        history.push('/');
      }
    } else {
      if (mapSummaryOpen) {
        dispatch(switchMap());
      } else {
        if (previousLocation && !previousLocation.state) {
          history.goBack();
        } else {
          history.push('/');
        }
      }
    }
  });

  const handleInviteButtonClick = useCallback(() => {
    dispatch(openInviteTargetDialog());
  });

  return (
    <Toolbar style={lgUp ? styles.toolbarLarge : styles.toolbarSmall}>
      <IconButton
        color="inherit"
        onClick={handleBackButtonClick}
        style={lgUp ? styles.backButtonLarge : styles.backButtonSmall}
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
        <Typography
          variant={smUp ? 'h6' : 'subtitle1'}
          color="inherit"
          noWrap
          style={styles.mapName}
        >
          {map.name}
        </Typography>
      )}
      <div style={styles.toolbarActions}>
        {isInvitable(map) && (
          <IconButton color="inherit" onClick={handleInviteButtonClick}>
            <PersonAddIcon />
          </IconButton>
        )}
        <MapShareMenu />
        {!map ? (
          <IconButton color="primary">
            <RefreshIcon />
          </IconButton>
        ) : map.editable ? (
          <MapVertMenu />
        ) : (
          <MapLikeActions target={map} />
        )}
      </div>
    </Toolbar>
  );
};

export default React.memo(MapToolbar);
