import React, { useCallback } from 'react';
import IconButton from '@material-ui/core/IconButton';

import { useDispatch } from 'redux-react-hook';

import toggleDrawer from '../../actions/toggleDrawer';
import ProfileAvatar from './ProfileAvatar';

const styles = {
  iconButton: {
    width: 48,
    height: 48
  },
  avatarContainer: {
    position: 'absolute'
  }
};

const AppMenuButton = () => {
  const dispatch = useDispatch();
  const handleButtonClick = useCallback(() => dispatch(toggleDrawer()));

  return (
    <IconButton onClick={handleButtonClick} style={styles.iconButton}>
      <div style={styles.avatarContainer}>
        <ProfileAvatar size={35} />
      </div>
    </IconButton>
  );
};

export default React.memo(AppMenuButton);
