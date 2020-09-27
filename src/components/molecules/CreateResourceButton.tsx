import React, { memo, useCallback, useContext } from 'react';
import { useDispatch } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import openCreateActions from '../../actions/openCreateActions';
import openPlaceSelectDialog from '../../actions/openPlaceSelectDialog';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '@material-ui/core';

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

type Props = {
  defaultCreateReview: boolean;
  disabled: boolean;
};

export default memo(function CreateResourceButton(props: Props) {
  const { defaultCreateReview, disabled } = props;
  const { currentUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const handleButtonClick = useCallback(() => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
    } else if (defaultCreateReview) {
      dispatch(openPlaceSelectDialog());
    } else {
      dispatch(openCreateActions());
    }
  }, [dispatch, currentUser, defaultCreateReview]);

  return (
    <Fab
      style={buttonStyle(props, smUp)}
      onClick={handleButtonClick}
      disabled={disabled}
      data-test="create-resource-button"
    >
      <AddIcon />
    </Fab>
  );
});
