import { Person } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { memo, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import ProfileContext from '../../context/ProfileContext';

export default memo(function PosterAvatar() {
  const { authenticated } = useContext(AuthContext);
  const profile = useContext(ProfileContext);

  if (!authenticated || !profile) {
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
        slotProps={{
          img: {
            alt: profile.name,
            loading: 'lazy'
          }
        }}
      />
    );
  }
  return <Avatar>{profile.name?.slice(0, 1)}</Avatar>;
});
