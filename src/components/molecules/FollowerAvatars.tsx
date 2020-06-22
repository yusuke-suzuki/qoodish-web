import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import openFollowersDialog from '../../actions/openFollowersDialog';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';

const FollowerAvatars = () => {
  const dispatch = useDispatch();

  const followers = useMappedState(
    useCallback(state => state.mapSummary.followers, [])
  );

  const handleFollowersClick = useCallback(() => {
    dispatch(openFollowersDialog());
  }, [dispatch]);

  return (
    <AvatarGroup max={9} onClick={handleFollowersClick}>
      {followers.map(follower => (
        <Avatar
          key={follower.id}
          src={follower.profile_image_url}
          alt={follower.name}
        />
      ))}
    </AvatarGroup>
  );
};

export default React.memo(FollowerAvatars);
