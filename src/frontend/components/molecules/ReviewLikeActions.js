import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import SharedLikeActions from './SharedLikeActions';

import openToast from '../../actions/openToast';
import editReview from '../../actions/editReview';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import I18n from '../../utils/I18n';
import { LikesApi } from 'qoodish_api';
import initializeApiClient from '../../utils/initializeApiClient';

const ReviewLikeActions = props => {
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

    apiInstance.reviewsReviewIdLikePost(
      props.target.id,
      (error, data, response) => {
        if (response.ok) {
          dispatch(editReview(response.body));
          dispatch(openToast(I18n.t('liked!')));

          gtag('event', 'like', {
            event_category: 'engagement',
            event_label: 'review'
          });
        } else {
          dispatch(openToast('Request failed.'));
        }
      }
    );
  });

  const handleUnlikeButtonClick = useCallback(async () => {
    await initializeApiClient();
    const apiInstance = new LikesApi();

    apiInstance.reviewsReviewIdLikeDelete(
      props.target.id,
      (error, data, response) => {
        if (response.ok) {
          dispatch(editReview(response.body));
          dispatch(openToast(I18n.t('unliked')));

          gtag('event', 'unlike', {
            event_category: 'engagement',
            event_label: 'review'
          });
        } else {
          dispatch(openToast('Request failed.'));
        }
      }
    );
  });

  return (
    <SharedLikeActions
      handleLikeButtonClick={handleLikeButtonClick}
      handleUnlikeButtonClick={handleUnlikeButtonClick}
      target={props.target}
    />
  );
};

export default React.memo(ReviewLikeActions);
