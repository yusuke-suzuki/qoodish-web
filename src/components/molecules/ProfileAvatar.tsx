import { useContext, useMemo } from 'react';
import AuthContext from '../../context/AuthContext';
import { Person } from '@material-ui/icons';
import { Avatar } from '@material-ui/core';

type Props = {
  profile: any;
  size?: number;
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

  if (profile && profile.image_url) {
    return (
      <Avatar
        src={profile.thumbnail_url_400}
        imgProps={{
          alt: profile.name,
          loading: 'lazy'
        }}
        style={avatarStyle}
      />
    );
  } else if (!currentUser || currentUser.isAnonymous) {
    return (
      <Avatar style={avatarStyle}>
        <Person style={iconStyle} />
      </Avatar>
    );
  } else {
    return (
      <Avatar style={avatarStyle}>
        {profile.name && profile.name.slice(0, 1)}
      </Avatar>
    );
  }
}
