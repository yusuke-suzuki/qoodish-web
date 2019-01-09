import React from 'react';
import {
  OverlayView
} from 'react-google-maps';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';

const styles = {
  overlayButton: {
    backgroundColor: 'white'
  }
};

const SpotMarkers = (props) => {
  return props.spots.map((spot, index) => (
    <OverlayView
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      key={index}
      position={
        new google.maps.LatLng(parseFloat(spot.lat), parseFloat(spot.lng))
      }
    >
      {props.large ?
      <Tooltip title={spot.name}>
        <Fab
          style={styles.overlayButton}
          onClick={() => props.onSpotMarkerClick(spot)}
        >
          <Avatar
            src={spot.image_url}
            alt={spot.name}
          />
        </Fab>
      </Tooltip>
      :
      <Fab
        style={styles.overlayButton}
        onClick={() => props.onSpotMarkerClick(spot)}
      >
        <Avatar
          src={spot.image_url}
          alt={spot.name}
        />
      </Fab>
      }
    </OverlayView>
  ));
}

export default SpotMarkers;
