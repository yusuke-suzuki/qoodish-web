import React from 'react';

import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import OverlayView from './OverlayView';

const styles = {
  overlayButton: {
    backgroundColor: 'white'
  }
};

const SpotMarker = props => {
  const { spot, large } = props;

  return (
    <OverlayView
      key={spot.id}
      position={
        new google.maps.LatLng(parseFloat(spot.lat), parseFloat(spot.lng))
      }
    >
      {large ? (
        <Tooltip title={spot.name}>
          <Fab style={styles.overlayButton} onClick={props.onClick}>
            <Badge badgeContent={spot.reviews_count} color="primary">
              <Avatar
                src={spot.thumbnail_url}
                imgProps={{
                  alt: spot.name,
                  loading: 'lazy'
                }}
              />
            </Badge>
          </Fab>
        </Tooltip>
      ) : (
        <Fab style={styles.overlayButton} onClick={props.onClick}>
          <Badge badgeContent={spot.reviews_count} color="primary">
            <Avatar
              src={spot.thumbnail_url}
              imgProps={{
                alt: spot.name,
                loading: 'lazy'
              }}
            />
          </Badge>
        </Fab>
      )}
    </OverlayView>
  );
};

export default React.memo(SpotMarker);
