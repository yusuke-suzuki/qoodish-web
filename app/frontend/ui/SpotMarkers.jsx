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

export default class SpotMarkers extends React.PureComponent {
  render() {
    return this.renderSpotMarkers();
  }

  renderSpotMarkers() {
    return this.props.spots.map((spot, index) => (
      <OverlayView
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        key={index}
        position={
          new google.maps.LatLng(parseFloat(spot.lat), parseFloat(spot.lng))
        }
      >
        {this.props.large ?
        <Tooltip title={spot.name}>
          <Button
            variant="fab"
            style={styles.overlayButton}
            onClick={() => this.props.onSpotMarkerClick(spot)}
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
          onClick={() => this.props.onSpotMarkerClick(spot)}
        >
          <Avatar
            src={spot.image_url}
          />
        </Button>
        }
      </OverlayView>
    ));
  }
}
