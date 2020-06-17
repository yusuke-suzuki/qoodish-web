import React, { useMemo } from 'react';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';

const ProfileAvatar = props => {
  const { currentUser, size } = props;

  const avatarStyle = useMemo(() => {
    return size ? { width: size, height: size } : { width: 40, height: 40 };
  }, [size]);

  const iconStyle = useMemo(() => {
    return size ? { fontSize: props.size } : { fontSize: 40 };
  }, [size]);

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
