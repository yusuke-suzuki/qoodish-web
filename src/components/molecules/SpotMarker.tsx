import React from 'react';

import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';

const styles = {
  overlayButton: {
    backgroundColor: 'white'
  }
};

const SpotMarker = props => {
  const { spot, large } = props;

  if (large) {
    return (
      <Tooltip title={spot.name}>
        <Fab style={styles.overlayButton} onClick={props.onClick}>
          <Badge badgeContent={spot.reviews_count} color="primary">
            <Avatar src={spot.thumbnail_url} alt={spot.name} loading="lazy" />
          </Badge>
        </Fab>
      </Tooltip>
    );
  } else {
    return (
      <Fab style={styles.overlayButton} onClick={props.onClick}>
        <Badge badgeContent={spot.reviews_count} color="primary">
          <Avatar src={spot.thumbnail_url} alt={spot.name} loading="lazy" />
        </Badge>
      </Fab>
    );
  }
};

export default React.memo(SpotMarker);
