import { Avatar, AvatarGroup } from '@mui/material';
import { memo } from 'react';
import type { Follower } from '../../../types';

type Props = {
  followers: Follower[];
};

function Followers({ followers }: Props) {
  return (
    <AvatarGroup max={9}>
      {followers.map((follower) => (
        <Avatar
          key={follower.id}
          alt={follower.name}
          src={follower.profile_image_url}
          sx={{ width: 40, height: 40 }}
        />
      ))}
    </AvatarGroup>
  );
}

export default memo(Followers);
