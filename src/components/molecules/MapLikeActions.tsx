import React, { useCallback, useContext } from 'react';
import { useDispatch } from 'redux-react-hook';
import SharedLikeActions from './SharedLikeActions';

import openToast from '../../actions/openToast';
import editMap from '../../actions/editMap';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import I18n from '../../utils/I18n';
import { LikesApi } from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';

const styles = {
  likeButton: {
    color: 'white'
  }
};

const MapLikeActions = props => {
  const { target } = props;
  const dispatch = useDispatch();

  const { currentUser } = useContext(AuthContext);

  const handleLikeButtonClick = useCallback(async () => {
    if (currentUser.isAnonymous) {
      dispatch(openSignInRequiredDialog());
      return;
    }

    const apiInstance = new LikesApi();
    apiInstance.mapsMapIdLikePost(target.id, (error, data, response) => {
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
  }, [dispatch, currentUser, target]);

  const handleUnlikeButtonClick = useCallback(async () => {
    const apiInstance = new LikesApi();
    apiInstance.mapsMapIdLikeDelete(target.id, (error, data, response) => {
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
    });
  }, [dispatch, target]);

  return (
    <SharedLikeActions
      handleLikeButtonClick={handleLikeButtonClick}
      handleUnlikeButtonClick={handleUnlikeButtonClick}
      target={target}
      style={styles.likeButton}
    />
  );
};

export default React.memo(MapLikeActions);
