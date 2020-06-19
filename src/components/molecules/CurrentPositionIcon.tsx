import React, { useContext, useCallback } from 'react';
import GoogleMapsContext from '../../GoogleMapsContext';
import { useMappedState } from 'redux-react-hook';

import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../../utils/I18n';
import OverlayView from './OverlayView';
import { useMediaQuery } from '@material-ui/core';

const styles = {
  overlayButton: {
    backgroundColor: 'white',
    width: 40,
    height: 40
  }
};

const CurrentPositionIcon = () => {
  const { googleMapsApi } = useContext(GoogleMapsContext);
  const mdUp = useMediaQuery('(min-width: 960px)');

  const mapState = useCallback(
    state => ({
      currentPosition: state.gMap.currentPosition,
      currentUser: state.app.currentUser
    }),
    []
  );
  const { currentPosition, currentUser } = useMappedState(mapState);

  if (
    !googleMapsApi ||
    !currentPosition ||
    !currentPosition.lat ||
    !currentPosition.lng
  ) {
    return null;
  }

  return (
    <OverlayView
      position={
        new googleMapsApi.LatLng(
          parseFloat(currentPosition.lat),
          parseFloat(currentPosition.lng)
        )
      }
    >
      {mdUp ? (
        <Tooltip title={I18n.t('you are hear')}>
          <Fab style={styles.overlayButton}>
            <Avatar
              src={currentUser.thumbnail_url}
              alt={I18n.t('you are hear')}
            />
          </Fab>
        </Tooltip>
      ) : (
        <Fab style={styles.overlayButton}>
          <Avatar
            src={currentUser.thumbnail_url}
            alt={I18n.t('you are hear')}
          />
        </Fab>
      )}
    </OverlayView>
  );
};

export default React.memo(CurrentPositionIcon);
