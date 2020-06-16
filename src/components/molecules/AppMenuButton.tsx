import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import IconButton from '@material-ui/core/IconButton';

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

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );
  const { currentUser } = useMappedState(mapState);

  return (
    <IconButton onClick={handleButtonClick} style={styles.iconButton}>
      <div style={styles.avatarContainer}>
        <ProfileAvatar size={35} currentUser={currentUser} />
      </div>
    </IconButton>
  );
};

export default React.memo(AppMenuButton);
