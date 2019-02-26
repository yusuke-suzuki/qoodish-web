import React from 'react';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';

const styles = {
  profileAvatarLarge: {
    marginTop: -70,
    width: 80,
    height: 80,
    position: 'absolute'
  },
  profileAvatarSmall: {
    marginTop: -64,
    width: 80,
    height: 80,
    position: 'absolute'
  },
  personIcon: {
    fontSize: 40
  }
};

const ProfileAvatar = props => {
  const large = useMediaQuery('(min-width: 600px)');
  const currentUser = props.currentUser;

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
