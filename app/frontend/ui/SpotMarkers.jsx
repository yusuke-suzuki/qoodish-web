import React from 'react';
import {
  OverlayView
} from 'react-google-maps';
import Button from '@material-ui/core/Button';
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
        <Button
          variant="fab"
          style={styles.overlayButton}
          onClick={() => props.onSpotMarkerClick(spot)}
        >
          <Avatar
            src={spot.image_url}
            alt={spot.name}
          />
        </Button>
      </Tooltip>
      :
      <Button
        variant="fab"
        style={styles.overlayButton}
        onClick={() => props.onSpotMarkerClick(spot)}
      >
        <Avatar
          src={spot.image_url}
          alt={spot.name}
        />
      </Button>
      }
    </OverlayView>
  ));
}

export default SpotMarkers;
