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

const SpotMarker = React.memo(props => {
  const { spot, large } = props;

  if (large) {
    return (
      <Tooltip title={spot.name}>
        <Fab style={styles.overlayButton} onClick={props.onClick}>
          <Badge badgeContent={spot.reviews.length} color="primary">
            <Avatar src={spot.thumbnail_url} alt={spot.name} />
          </Badge>
        </Fab>
      </Tooltip>
    );
  } else {
    return (
      <Fab style={styles.overlayButton} onClick={props.onClick}>
        <Badge badgeContent={spot.reviews.length} color="primary">
          <Avatar src={spot.thumbnail_url} alt={spot.name} />
        </Badge>
      </Fab>
    );
  }
});

export default React.memo(SpotMarker);
