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
  buttonWithoutBottomSeat: {
    zIndex: 1100,
    position: 'fixed',
    bottom: 20,
    right: 20,
    backgroundColor: 'red',
    color: 'white'
  }
};

export default class CreateReviewButton extends React.Component {
  render() {
    return (
      <Button
        variant="fab"
        aria-label="add"
        style={this.buttonStyle()}
        onClick={this.props.handleButtonClick}
      >
        <EditIcon />
      </Button>
    );
  }

  buttonStyle() {
    if (this.props.withoutBottomSeat) {
      return styles.buttonWithoutBottomSeat;
    } else {
      return this.props.large ? styles.buttonLarge : styles.buttonSmall;
    }
  }
}
