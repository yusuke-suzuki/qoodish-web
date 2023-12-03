import { Avatar, AvatarGroup, Skeleton } from '@mui/material';
import { memo } from 'react';
import { AppMap, Follower } from '../../../types';
import { useMapFollowers } from '../../hooks/useMapFollowers';

type FollowersProps = {
  map: AppMap | null;
};

function Followers({ map }: FollowersProps) {
  const { followers, isLoading } = useMapFollowers(map ? map.id : null);

  return (
    <AvatarGroup max={9}>
      {(isLoading ? Array.from(new Array(4)) : followers).map(
        (follower: Follower | null, i) =>
          follower ? (
            <Avatar
              key={follower.id}
              src={follower.profile_image_url}
              alt={follower.name}
              imgProps={{
                loading: 'lazy'
              }}
            />
          ) : (
            <Skeleton variant="circular" width={40} height={40} key={i} />
          )
      )}
    </AvatarGroup>
  );
}

export default memo(Followers);
