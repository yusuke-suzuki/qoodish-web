import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import { OverlayView } from 'react-google-maps';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';

import openSpotCard from '../../actions/openSpotCard';
import selectSpot from '../../actions/selectSpot';

const styles = {
  overlayButton: {
    backgroundColor: 'white'
  }
};

const SpotMarkers = props => {
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');

  const spots = useMappedState(useCallback(state => state.gMap.spots, []));

  const onSpotMarkerClick = useCallback(async spot => {
    dispatch(selectSpot(spot));
    dispatch(openSpotCard());
  });

  return spots.map((spot, index) => (
    <OverlayView
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      key={index}
      position={
        new google.maps.LatLng(parseFloat(spot.lat), parseFloat(spot.lng))
      }
    >
      {large ? (
        <Tooltip title={spot.name}>
          <Fab
            style={styles.overlayButton}
            onClick={() => onSpotMarkerClick(spot)}
          >
            <Avatar src={spot.image_url} alt={spot.name} />
          </Fab>
        </Tooltip>
      ) : (
        <Fab
          style={styles.overlayButton}
          onClick={() => onSpotMarkerClick(spot)}
        >
          <Avatar src={spot.image_url} alt={spot.name} />
        </Fab>
      )}
    </OverlayView>
  ));
};

export default React.memo(SpotMarkers);
