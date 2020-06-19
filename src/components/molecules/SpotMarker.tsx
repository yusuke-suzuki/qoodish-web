import React, { useContext } from 'react';

import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import OverlayView from './OverlayView';
import GoogleMapsContext from '../../GoogleMapsContext';

const styles = {
  overlayButton: {
    backgroundColor: 'white'
  }
};

const SpotMarker = props => {
  const { spot, large } = props;
  const { googleMapsApi } = useContext(GoogleMapsContext);

  if (!googleMapsApi) {
    return null;
  }

  return (
    <OverlayView
      key={spot.id}
      position={
        new googleMapsApi.LatLng(parseFloat(spot.lat), parseFloat(spot.lng))
      }
    >
      {large ? (
        <Tooltip title={spot.name}>
          <Fab style={styles.overlayButton} onClick={props.onClick}>
            <Badge badgeContent={spot.reviews_count} color="primary">
              <Avatar src={spot.thumbnail_url} alt={spot.name} loading="lazy" />
            </Badge>
          </Fab>
        </Tooltip>
      ) : (
        <Fab style={styles.overlayButton} onClick={props.onClick}>
          <Badge badgeContent={spot.reviews_count} color="primary">
            <Avatar src={spot.thumbnail_url} alt={spot.name} loading="lazy" />
          </Badge>
        </Fab>
      )}
    </OverlayView>
  );
};

export default React.memo(SpotMarker);
