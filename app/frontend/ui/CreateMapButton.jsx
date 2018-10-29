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

const CreateMapButton = (props) => {
  return (
    <Button
      variant="fab"
      aria-label="add"
      style={
        props.large ? styles.createButtonLarge : styles.createButtonSmall
      }
      onClick={() => props.handleButtonClick(props.currentUser)}
    >
      <AddIcon />
    </Button>
  );
}

export default CreateMapButton;
