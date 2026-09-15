import { Person } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { memo, useContext } from 'react';
import type { Profile } from '../../../types/index.ts';
import AuthContext from '../../context/AuthContext.ts';
import ProfileBoundary from '../common/ProfileBoundary.tsx';

function PosterAvatarContent({ profile }: { profile: Profile | null }) {
  const { authenticated } = useContext(AuthContext);

  if (!authenticated || !profile) {
    return (
      <Avatar>
        <Person />
      </Avatar>
    );
  }
  if (profile.image) {
    return (
      <Avatar
        src={profile.image.avatar}
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
}

export default memo(function PosterAvatar() {
  return (
    <ProfileBoundary>
      {(profile) => <PosterAvatarContent profile={profile} />}
    </ProfileBoundary>
  );
});
