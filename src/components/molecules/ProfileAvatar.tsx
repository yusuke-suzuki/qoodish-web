import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';

const ProfileAvatar = props => {
  const { currentUser } = props;

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
        src={currentUser.thumbnail_url_400}
        style={avatarStyle}
        alt={currentUser.name}
        loading="lazy"
      />
    );
  }
};

export default React.memo(ProfileAvatar);
