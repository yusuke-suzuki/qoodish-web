import React from 'react';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

const styles = {
  buttonLarge: {
    zIndex: 1100,
    position: 'fixed',
    bottom: 32,
    right: 32,
    backgroundColor: '#ffc107',
    color: 'white'
  },
  buttonSmall: {
    zIndex: 1100,
    position: 'fixed',
    bottom: 20,
    right: 20,
    backgroundColor: '#ffc107',
    color: 'white'
  },
  withBottomAction: {
    position: 'relative',
    bottom: 28,
    right: 'unset'
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

const buttonStyle = (props) => {
  let style = {};
  if (props.large) {
    style = Object.assign(style, styles.buttonLarge);
  } else {
    style = Object.assign(style, styles.buttonSmall)
  }
  if (props.bottomAction) {
    style = Object.assign(style, styles.withBottomAction);
  }
  if (props.buttonForMap) {
    style = Object.assign(style, styles.forMap);
  }
  if (props.disabled) {
    style = Object.assign(style, styles.disabled);
  }
  return style;
};

const CreateResourceButton = (props) => {
  return (
    <Fab
      style={buttonStyle(props)}
      onClick={() => props.handleButtonClick(props.currentUser)}
      disabled={props.disabled}
    >
      <AddIcon />
    </Fab>
  );
};

export default CreateResourceButton;
