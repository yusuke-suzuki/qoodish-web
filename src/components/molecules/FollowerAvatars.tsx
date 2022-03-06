import { Avatar } from '@material-ui/core';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import { memo, useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import openFollowersDialog from '../../actions/openFollowersDialog';

export default memo(function FollowerAvatars() {
  const dispatch = useDispatch();

  const followers = useMappedState(
    useCallback(state => state.mapSummary.followers, [])
  );

  const handleFollowersClick = useCallback(() => {
    dispatch(openFollowersDialog());
  }, [dispatch]);

  return (
    <AvatarGroup max={9} onClick={handleFollowersClick}>
      {followers.map(follower => {
        return follower.profile_image_url ? (
          <Avatar
            key={follower.id}
            src={follower.profile_image_url}
            alt={follower.name}
          />
        ) : (
          <Avatar key={follower.id} alt={follower.name}>
            {follower.name.slice(0, 1)}
          </Avatar>
        );
      })}
    </AvatarGroup>
  );
});
