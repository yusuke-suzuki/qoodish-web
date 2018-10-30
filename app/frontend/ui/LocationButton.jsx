import React from 'react';
import Button from '@material-ui/core/Button';
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

const LocationButton = (props) => {
  return (
    <Button
      variant="fab"
      style={props.large ? styles.buttonLarge : styles.buttonSmall}
      onClick={props.handleButtonClick}
    >
      <MyLocationIcon />
    </Button>
  );
}

export default LocationButton;
