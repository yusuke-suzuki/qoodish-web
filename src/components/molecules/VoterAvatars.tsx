import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import fetchLikes from '../../actions/fetchLikes';
import openLikesDialog from '../../actions/openLikesDialog';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import { LikesApi } from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';

const VoterAvatars = () => {
  const [likes, setLikes] = useState([]);
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentMap: state.mapSummary.currentMap
    }),
    []
  );
  const { currentMap } = useMappedState(mapState);
  const { currentUser } = useContext(AuthContext);

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
  }, [currentMap, currentUser]);

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
