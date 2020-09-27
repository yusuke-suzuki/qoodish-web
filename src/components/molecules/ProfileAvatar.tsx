import React, { useContext, useMemo } from 'react';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';
import AuthContext from '../../context/AuthContext';

type Props = {
  profile: any;
  size: number;
};

export default function ProfileAvatar(props: Props) {
  const { profile, size } = props;
  const { currentUser } = useContext(AuthContext);

  const avatarStyle = useMemo(() => {
    return size ? { width: size, height: size } : { width: 40, height: 40 };
  }, [size]);

  const iconStyle = useMemo(() => {
    return size ? { fontSize: size } : { fontSize: 40 };
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
        src={profile.thumbnail_url_400}
        style={avatarStyle}
        alt={profile.name}
        loading="lazy"
      />
    );
  }
}
