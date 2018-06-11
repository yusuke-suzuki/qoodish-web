import React from 'react';
import Button from 'material-ui/Button';
import EditIcon from 'material-ui-icons/Edit';

const styles = {
  buttonLarge: {
    zIndex: 1100,
    position: 'fixed',
    bottom: 32,
    right: 32,
    backgroundColor: 'red',
    color: 'white'
  },
  buttonSmall: {
    zIndex: 1100,
    position: 'fixed',
    bottom: 76,
    right: 20,
    backgroundColor: 'red',
    color: 'white'
  },
  buttonForMap: {
    zIndex: 1100,
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'red',
    color: 'white'
  },
  disabledButton: {
    zIndex: 1100,
    position: 'absolute',
    bottom: 20,
    right: 20
  }
};

export default class CreateReviewButton extends React.Component {
  render() {
    return (
      <Button
        variant="fab"
        aria-label="add"
        style={this.buttonStyle(this.props)}
        onClick={this.props.handleButtonClick}
        disabled={this.props.disabled}
      >
        <EditIcon />
      </Button>
    );
  }

  buttonStyle(props) {
    if (props.buttonForMap) {
      if (props.disabled) {
        return styles.disabledButton;
      } else {
        return styles.buttonForMap;
      }
    } else {
      return props.large ? styles.buttonLarge : styles.buttonSmall;
    }
  }
}
