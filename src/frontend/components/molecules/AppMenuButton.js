import React, { useCallback } from 'react';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';

import { useDispatch, useMappedState } from 'redux-react-hook';

import toggleDrawer from '../../actions/toggleDrawer';

const styles = {
  profileAvatar: {
    width: 35,
    height: 35
  }
};

const AppMenuButton = () => {
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );
  const { currentUser } = useMappedState(mapState);

  const handleButtonClick = useCallback(() => dispatch(toggleDrawer()));

  return (
    <IconButton onClick={handleButtonClick}>
      <Avatar
        src={currentUser.isAnonymous ? '' : currentUser.thumbnail_url}
        style={styles.profileAvatar}
      >
        {currentUser.isAnonymous && <PersonIcon style={styles.profileAvatar} />}
      </Avatar>
    </IconButton>
  );
};

export default React.memo(AppMenuButton);
