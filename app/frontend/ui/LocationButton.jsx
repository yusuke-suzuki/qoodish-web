import React from 'react';
import Fab from '@material-ui/core/Fab';
import MyLocationIcon from '@material-ui/icons/MyLocation';

const styles = {
  buttonLarge: {
    zIndex: 1100,
    position: 'absolute',
    bottom: 108,
    right: 32,
    backgroundColor: 'white'
  },
  buttonSmall: {
    zIndex: 1100,
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: 'white'
  }
};

const LocationButton = props => {
  return (
    <Fab
      style={props.large ? styles.buttonLarge : styles.buttonSmall}
      onClick={props.handleButtonClick}
    >
      <MyLocationIcon />
    </Fab>
  );
};

export default LocationButton;
