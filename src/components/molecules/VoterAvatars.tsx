import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import fetchLikes from '../../actions/fetchLikes';
import openLikesDialog from '../../actions/openLikesDialog';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import { LikesApi } from '@yusuke-suzuki/qoodish-api-js-client';

const VoterAvatars = () => {
  const [likes, setLikes] = useState([]);
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser,
      currentMap: state.mapSummary.currentMap
    }),
    []
  );
  const { currentUser, currentMap } = useMappedState(mapState);

  const refreshLikes = useCallback(async () => {
    const apiInstance = new LikesApi();

    apiInstance.mapsMapIdLikesGet(currentMap.id, (error, data, response) => {
      if (response.ok) {
        setLikes(response.body);
        dispatch(fetchLikes(response.body));
      }
    });
  }, [dispatch, currentMap]);

  const handleLikesClick = useCallback(() => {
    dispatch(openLikesDialog());
  }, [dispatch]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }
    if (currentMap) {
      refreshLikes();
    }
  }, [currentMap, currentUser.uid]);

  return (
    <AvatarGroup max={9} onClick={handleLikesClick}>
      {likes.map(like => (
        <Avatar
          key={like.id}
          src={like.voter.profile_image_url}
          alt={like.voter.name}
        />
      ))}
    </AvatarGroup>
  );
};

export default React.memo(VoterAvatars);
