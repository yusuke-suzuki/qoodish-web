import React from 'react';
import Button from 'material-ui/Button';
import MyLocationIcon from 'material-ui-icons/MyLocation';

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

export default class LocationButton extends React.Component {
  render() {
    return (
      <Button
        variant="fab"
        style={this.props.large ? styles.buttonLarge : styles.buttonSmall}
        onClick={this.props.handleButtonClick}
      >
        <MyLocationIcon />
      </Button>
    );
  }
}
