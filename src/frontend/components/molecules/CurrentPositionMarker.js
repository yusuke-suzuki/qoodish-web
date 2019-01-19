import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import { OverlayView, Marker } from 'react-google-maps';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../../utils/I18n';

const styles = {
  overlayButton: {
    backgroundColor: 'white',
    width: 40,
    height: 40
  }
};

const ProfileIcon = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      currentPosition: state.gMap.currentPosition
    }),
    []
  );
  const { currentUser, currentPosition } = useMappedState(mapState);

  return (
    <OverlayView
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      position={currentPosition}
    >
      {large ? (
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

const CurrentPositionMarker = () => {
  const currentPosition = useMappedState(
    useCallback(state => state.gMap.currentPosition, [])
  );

  return currentPosition.lat && currentPosition.lng ? (
    <div>
      <Marker
        options={{
          position: currentPosition,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#0088ff',
            fillOpacity: 0.8,
            strokeColor: '#0088ff',
            strokeOpacity: 0.2
          }
        }}
      />
      <ProfileIcon />
    </div>
  ) : null;
};

export default React.memo(CurrentPositionMarker);
