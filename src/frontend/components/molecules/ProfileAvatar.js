import React, { useCallback } from 'react';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';
import { useMappedState } from 'redux-react-hook';

const ProfileAvatar = props => {
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );
  const { currentUser } = useMappedState(mapState);

  const avatarStyle = props.size
    ? { width: props.size, height: props.size }
    : { width: 40, height: 40 };
  const iconStyle = props.size ? { fontSize: props.size } : { fontSize: 40 };

  if (!currentUser || currentUser.isAnonymous) {
    return (
      <Avatar style={avatarStyle}>
        <PersonIcon style={iconStyle} />
      </Avatar>
    );
  } else {
    return (
      <Avatar
        src={currentUser.thumbnail_url}
        style={avatarStyle}
        alt={currentUser.name}
      />
    );
  }
};

export default React.memo(ProfileAvatar);
