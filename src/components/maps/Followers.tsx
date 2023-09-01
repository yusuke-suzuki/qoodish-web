import { AvatarGroup, Skeleton } from '@mui/material';
import { memo } from 'react';
import { AppMap, Follower } from '../../../types';
import { useMapFollowers } from '../../hooks/useMapFollowers';
import AuthorAvatar from '../common/AuthorAvatar';

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
            <AuthorAvatar key={follower.id} author={follower} />
          ) : (
            <Skeleton variant="circular" width={40} height={40} key={i} />
          )
      )}
    </AvatarGroup>
  );
}

export default memo(Followers);
