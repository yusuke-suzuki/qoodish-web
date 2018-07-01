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
    bottom: 20,
    right: 20,
    backgroundColor: 'red',
    color: 'white'
  },
  withBottomSeat: {
    bottom: 76,
  },
  forMap: {
    position: 'absolute'
  },
  disabled: {
    color: 'rgba(0, 0, 0, 0.26)',
    boxShadow: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.12)'
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
    let style = {};
    if (props.large) {
      style = Object.assign(style, styles.buttonLarge);
    } else {
      style = Object.assign(style, styles.buttonSmall)
    }
    if (props.buttonWithBottomSeat) {
      style = Object.assign(style, styles.withBottomSeat);
    }
    if (props.buttonForMap) {
      style = Object.assign(style, styles.forMap);
    }
    if (props.disabled) {
      style = Object.assign(style, styles.disabled);
    }
    return style;
  }
}
