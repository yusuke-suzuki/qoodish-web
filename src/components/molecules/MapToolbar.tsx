import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import LockIcon from '@material-ui/icons/Lock';
import RefreshIcon from '@material-ui/icons/Refresh';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Tooltip from '@material-ui/core/Tooltip';

import I18n from '../../utils/I18n';

import MapShareMenu from './MapShareMenu';
import MapVertMenu from './MapVertMenu';
import MapLikeActions from './MapLikeActions';
import openInviteTargetDialog from '../../actions/openInviteTargetDialog';
import BackButton from './BackButton';

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
  },
  backButtonLarge: {
    marginRight: 12
  },
  backButtonSmall: {}
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
      map: state.mapSummary.currentMap
    }),
    []
  );
  const { map } = useMappedState(mapState);

  const handleInviteButtonClick = useCallback(() => {
    dispatch(openInviteTargetDialog());
  });

  return (
    <Toolbar style={lgUp ? styles.toolbarLarge : styles.toolbarSmall}>
      <div style={lgUp ? styles.backButtonLarge : styles.backButtonSmall}>
        <BackButton />
      </div>
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
          <Tooltip title={I18n.t('button invite')}>
            <IconButton color="inherit" onClick={handleInviteButtonClick}>
              <PersonAddIcon />
            </IconButton>
          </Tooltip>
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
