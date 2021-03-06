import React, { useCallback, useContext } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import SharedLikeActions from './SharedLikeActions';

import openToast from '../../actions/openToast';
import editReview from '../../actions/editReview';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import I18n from '../../utils/I18n';
import { LikesApi } from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
const ReviewLikeActions = props => {
  const { target } = props;
  const dispatch = useDispatch();

  const { currentUser } = useContext(AuthContext);

  const handleLikeButtonClick = useCallback(async () => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }

    const apiInstance = new LikesApi();

    apiInstance.reviewsReviewIdLikePost(target.id, (error, data, response) => {
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
    });
  }, [dispatch, target, currentUser]);

  const handleUnlikeButtonClick = useCallback(async () => {
    const apiInstance = new LikesApi();

    apiInstance.reviewsReviewIdLikeDelete(
      target.id,
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
  }, [dispatch, target]);

  return (
    <SharedLikeActions
      handleLikeButtonClick={handleLikeButtonClick}
      handleUnlikeButtonClick={handleUnlikeButtonClick}
      target={target}
    />
  );
};

export default React.memo(ReviewLikeActions);
