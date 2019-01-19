import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';

const styles = {
  profileAvatarLarge: {
    marginTop: -64,
    width: 80,
    height: 80,
    position: 'absolute'
  },
  profileAvatarSmall: {
    marginTop: -54,
    width: 80,
    height: 80,
    position: 'absolute'
  },
  personIcon: {
    fontSize: 40
  }
};

const ProfileAvatar = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );

  const { currentUser } = useMappedState(mapState);

  if (!currentUser || currentUser.isAnonymous) {
    return (
      <Avatar
        style={large ? styles.profileAvatarLarge : styles.profileAvatarSmall}
      >
        <PersonIcon style={styles.personIcon} />
      </Avatar>
    );
  } else {
    return (
      <Avatar
        src={currentUser.thumbnail_url}
        style={large ? styles.profileAvatarLarge : styles.profileAvatarSmall}
        alt={currentUser.name}
      />
    );
  }
};

export default React.memo(ProfileAvatar);
