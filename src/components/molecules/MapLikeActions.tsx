import React, { memo, useCallback, useContext } from 'react';
import { useDispatch } from 'redux-react-hook';
import SharedLikeActions from './SharedLikeActions';

import openToast from '../../actions/openToast';
import editMap from '../../actions/editMap';
import openSignInRequiredDialog from '../../actions/openSignInRequiredDialog';
import { LikesApi } from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import { createStyles, makeStyles } from '@material-ui/core';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(() =>
  createStyles({
    likeButton: {
      color: 'white'
    }
  })
);

type Props = {
  target: any;
};

export default memo(function MapLikeActions(props: Props) {
  const { target } = props;
  const dispatch = useDispatch();
  const classes = useStyles();
  const { I18n } = useLocale();

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
      className={classes.likeButton}
    />
  );
});
