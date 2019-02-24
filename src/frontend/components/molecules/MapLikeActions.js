import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import SharedLikeActions from './SharedLikeActions';

import ApiClient from '../../utils/ApiClient';
import openToast from '../../actions/openToast';
import editMap from '../../actions/editMap';
import fetchLikes from '../../actions/fetchLikes';
import openLikesDialog from '../../actions/openLikesDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import I18n from '../../utils/I18n';
import { LikesApi } from 'qoodish_api';
import initializeApiClient from '../../utils/initializeApiClient';

const MapLikeActions = props => {
  const dispatch = useDispatch();
  const currentUser = useMappedState(
    useCallback(state => state.app.currentUser, [])
  );

  const handleLikeButtonClick = useCallback(async () => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }

    await initializeApiClient();

    const apiInstance = new LikesApi();
    apiInstance.mapsMapIdLikePost(props.target.id, (error, data, response) => {
      if (response.ok) {
        dispatch(editMap(response.body));
        dispatch(openToast(I18n.t('liked!')));

        gtag('event', 'like', {
          event_category: 'engagement',
          event_label: 'map'
        });
      } else {
        dispatch(openToast('Request failed.'));
      }
    });
  });

  const handleUnlikeButtonClick = useCallback(async () => {
    await initializeApiClient();

    const apiInstance = new LikesApi();
    apiInstance.mapsMapIdLikeDelete(
      props.target.id,
      (error, data, response) => {
        if (response.ok) {
          dispatch(editMap(response.body));
          dispatch(openToast(I18n.t('unliked')));

          gtag('event', 'unlike', {
            event_category: 'engagement',
            event_label: 'map'
          });
        } else {
          dispatch(openToast('Request failed.'));
        }
      }
    );
  });

  const handleLikesClick = useCallback(async () => {
    const client = new ApiClient();
    let response = await client.fetchMapLikes(props.target.id);
    if (response.ok) {
      let likes = await response.json();
      dispatch(fetchLikes(likes));
      dispatch(openLikesDialog());
    }
  });

  return (
    <SharedLikeActions
      handleLikeButtonClick={handleLikeButtonClick}
      handleUnlikeButtonClick={handleUnlikeButtonClick}
      handleLikesClick={handleLikesClick}
      target={props.target}
    />
  );
};

export default React.memo(MapLikeActions);
