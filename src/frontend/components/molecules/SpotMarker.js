import React from 'react';

import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';

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
          <Avatar src={spot.image_url} alt={spot.name} />
        </Fab>
      </Tooltip>
    );
  } else {
    return (
      <Fab style={styles.overlayButton} onClick={props.onClick}>
        <Avatar src={spot.image_url} alt={spot.name} />
      </Fab>
    );
  }
});

export default React.memo(SpotMarker);
