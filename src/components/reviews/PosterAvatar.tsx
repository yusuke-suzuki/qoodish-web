import { Person } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { memo, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';

export default memo(function PosterAvatar() {
  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);

  if (!currentUser || !profile) {
    return (
      <Avatar>
        <Person />
      </Avatar>
    );
  }
  if (profile.thumbnail_url) {
    return (
      <Avatar
        src={profile.thumbnail_url}
        imgProps={{
          alt: profile.name,
          loading: 'lazy'
        }}
      />
    );
  }
  return <Avatar>{profile.name?.slice(0, 1)}</Avatar>;
});
