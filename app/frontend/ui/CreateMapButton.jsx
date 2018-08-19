import React from 'react';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

const styles = {
  createButtonLarge: {
    zIndex: 1100,
    position: 'fixed',
    bottom: 32,
    right: 32,
    backgroundColor: 'red',
    color: 'white'
  },
  createButtonSmall: {
    zIndex: 1100,
    position: 'fixed',
    bottom: 76,
    right: 20,
    backgroundColor: 'red',
    color: 'white'
  }
};

export default class CreateMapButton extends React.PureComponent {
  render() {
    return (
      <Button
        variant="fab"
        aria-label="add"
        style={
          this.props.large ? styles.createButtonLarge : styles.createButtonSmall
        }
        onClick={() => this.props.handleButtonClick(this.props.currentUser)}
      >
        <AddIcon />
      </Button>
    );
  }
}
