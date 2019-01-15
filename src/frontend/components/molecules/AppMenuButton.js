import React, { useCallback } from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';

import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';
import { useDispatch } from 'redux-react-hook';

import toggleDrawer from '../../actions/toggleDrawer';

const styles = {
  leftButton: {
    position: 'absolute',
    marginLeft: 8,
    color: 'white'
  }
};

const AppMenuButton = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();
  const handleButtonClick = useCallback(() => dispatch(toggleDrawer()));

  return (
    <IconButton
      color="inherit"
      onClick={handleButtonClick}
      style={large ? {} : styles.leftButton}
    >
      <MenuIcon />
    </IconButton>
  );
};

export default React.memo(AppMenuButton);
