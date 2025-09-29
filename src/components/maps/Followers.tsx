import { Avatar, AvatarGroup, Skeleton } from '@mui/material';
import { memo } from 'react';
import type { AppMap, Follower } from '../../../types';
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
              alt={follower.name}
              src={follower.profile_image_url}
              sx={{ width: 40, height: 40 }}
            />
          ) : (
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              // biome-ignore lint/suspicious/noArrayIndexKey: The list is static and does not require a unique key.
              key={`skeleton-follower-${i}`}
            />
          )
      )}
    </AvatarGroup>
  );
}

export default memo(Followers);
