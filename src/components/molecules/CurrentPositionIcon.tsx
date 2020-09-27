import React, { useContext, useCallback, memo } from 'react';
import GoogleMapsContext from '../../context/GoogleMapsContext';
import { useMappedState } from 'redux-react-hook';

import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import I18n from '../../utils/I18n';
import OverlayView from './OverlayView';
import { useMediaQuery, useTheme } from '@material-ui/core';

const styles = {
  overlayButton: {
    backgroundColor: 'white',
    width: 40,
    height: 40
  }
};

export default memo(function CurrentPositionIcon() {
  const { googleMapsApi } = useContext(GoogleMapsContext);
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const mapState = useCallback(
    state => ({
      currentPosition: state.gMap.currentPosition,
      profile: state.app.profile
    }),
    []
  );
  const { currentPosition, profile } = useMappedState(mapState);

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
            <Avatar src={profile.thumbnail_url} alt={I18n.t('you are hear')} />
          </Fab>
        </Tooltip>
      ) : (
        <Fab style={styles.overlayButton}>
          <Avatar src={profile.thumbnail_url} alt={I18n.t('you are hear')} />
        </Fab>
      )}
    </OverlayView>
  );
});
