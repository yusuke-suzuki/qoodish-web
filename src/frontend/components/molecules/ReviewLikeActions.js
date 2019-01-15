import React, { useCallback } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import SharedLikeActions from './SharedLikeActions';

import ApiClient from '../../utils/ApiClient';
import openToast from '../../actions/openToast';
import editReview from '../../actions/editReview';
import fetchLikes from '../../actions/fetchLikes';
import openLikesDialog from '../../actions/openLikesDialog';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import I18n from '../../utils/I18n';

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
    const client = new ApiClient();
    let response = await client.likeReview(ownProps.target.id);
    if (response.ok) {
      let review = await response.json();
      dispatch(editReview(review));
      dispatch(openToast(I18n.t('liked!')));

      gtag('event', 'like', {
        event_category: 'engagement',
        event_label: 'review'
      });
    } else {
      dispatch(openToast('Request failed.'));
    }
  });

  const handleUnlikeButtonClick = useCallback(async () => {
    const client = new ApiClient();
    let response = await client.unlikeReview(ownProps.target.id);
    if (response.ok) {
      let review = await response.json();
      dispatch(editReview(review));
      dispatch(openToast(I18n.t('unliked')));

      gtag('event', 'unlike', {
        event_category: 'engagement',
        event_label: 'review'
      });
    } else {
      dispatch(openToast('Request failed.'));
    }
  });

  const handleLikesClick = useCallback(async () => {
    const client = new ApiClient();
    let response = await client.fetchReviewLikes(ownProps.target.id);
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

export default React.memo(ReviewLikeActions);
