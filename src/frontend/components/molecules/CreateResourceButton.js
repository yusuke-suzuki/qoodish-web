import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import openCreateActions from '../../actions/openCreateActions';

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

const buttonStyle = (props, large) => {
  let style = {};
  if (large) {
    style = Object.assign(style, styles.buttonLarge);
  } else {
    style = Object.assign(style, styles.buttonSmall);
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

const CreateResourceButton = props => {
  const currentUser = useMappedState(
    useCallback(state => state.app.currentUser, [])
  );
  const dispatch = useDispatch();
  const large = useMediaQuery('(min-width: 600px)');

  const handleButtonClick = useCallback(() => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
    } else {
      dispatch(openCreateActions());
    }
  });

  return (
    <Fab
      style={buttonStyle(props, large)}
      onClick={handleButtonClick}
      disabled={props.disabled}
      data-test="create-resource-button"
    >
      <AddIcon />
    </Fab>
  );
};

export default React.memo(CreateResourceButton);
