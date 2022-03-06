import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useContext
} from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Checkbox from '@material-ui/core/Checkbox';

import I18n from '../../utils/I18n';
import openToast from '../../actions/openToast';
import {
  PushNotification,
  PushNotificationApi
} from '@yusuke-suzuki/qoodish-api-js-client';
import fetchMyProfile from '../../actions/fetchMyProfile';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import AuthContext from '../../context/AuthContext';
import ServiceWorkerContext from '../../context/ServiceWorkerContext';
import { usePushManager } from '../../hooks/usePushManager';

const PushSettings = () => {
  const { registration } = useContext(ServiceWorkerContext);

  const { isSubscribed, subscribe, unsubscribe } = usePushManager();

  const [likedEnabled, setLikedEnabled] = useState(false);
  const [followedEnabled, setFollowedEnabled] = useState(false);
  const [invitedEnabled, setInvitedEnabled] = useState(false);
  const [commentEnabled, setCommentEnabled] = useState(false);

  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      profile: state.app.profile
    }),
    []
  );
  const { profile } = useMappedState(mapState);

  const { currentUser } = useContext(AuthContext);

  const initPushSettings = useCallback(() => {
    setLikedEnabled(profile.push_notification.liked);
    setFollowedEnabled(profile.push_notification.followed);
    setInvitedEnabled(profile.push_notification.invited);
    setCommentEnabled(profile.push_notification.comment);
  }, [profile]);

  const handleEnablePush = useCallback(async () => {
    dispatch(requestStart());

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      await subscribe();

      dispatch(requestFinish());
      dispatch(openToast(I18n.t('push enabled')));
    } else {
      dispatch(requestFinish());
      dispatch(openToast(I18n.t('push disabled')));
    }
  }, [dispatch, subscribe]);

  const handleDisablePush = useCallback(async () => {
    dispatch(requestStart());

    await unsubscribe();

    dispatch(requestFinish());
    dispatch(openToast(I18n.t('push disabled')));
  }, [unsubscribe, dispatch]);

  const handlePushChange = useCallback(
    (_e, checked) => {
      if (checked) {
        handleEnablePush();
      } else {
        handleDisablePush();
      }
    },
    [handleEnablePush, handleDisablePush]
  );

  const handleChange = useCallback(
    (action, checked) => {
      dispatch(requestStart());

      const pushNotification = new PushNotification();
      pushNotification.liked = profile.push_notification.liked;
      pushNotification.followed = profile.push_notification.followed;
      pushNotification.invited = profile.push_notification.invited;
      pushNotification.comment = profile.push_notification.comment;
      pushNotification[action] = checked;

      const apiInstance = new PushNotificationApi();

      apiInstance.usersUserIdPushNotificationPut(
        currentUser.uid,
        pushNotification,
        (error, data, response) => {
          dispatch(requestFinish());
          if (response.ok) {
            dispatch(fetchMyProfile(response.body));
            dispatch(openToast(I18n.t('push update success')));
          } else {
            dispatch(openToast(response.body.detail));
          }
        }
      );
    },
    [dispatch, currentUser, profile]
  );

  const disabled = useMemo(() => {
    return !currentUser || !registration || currentUser.isAnonymous;
  }, [currentUser, registration]);

  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous || !profile.push_notification) {
      return;
    }

    initPushSettings();
  }, [currentUser, profile]);

  return (
    <Card elevation={0}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {I18n.t('push settings')}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isSubscribed}
              onChange={handlePushChange}
              disabled={disabled}
            />
          }
          label={
            <Typography variant="subtitle1">
              {I18n.t('enable push notification')}
            </Typography>
          }
        />
        <br />
        <FormControlLabel
          control={
            <Checkbox
              checked={likedEnabled}
              onChange={(e, checked) => handleChange('liked', checked)}
              disabled={disabled}
            />
          }
          label={I18n.t('push for liked')}
        />
        <br />
        <FormControlLabel
          control={
            <Checkbox
              checked={followedEnabled}
              onChange={(e, checked) => handleChange('followed', checked)}
              disabled={disabled}
            />
          }
          label={I18n.t('push for followed')}
        />
        <br />
        <FormControlLabel
          control={
            <Checkbox
              checked={invitedEnabled}
              onChange={(e, checked) => handleChange('invited', checked)}
              disabled={disabled}
            />
          }
          label={I18n.t('push for invited')}
        />
        <br />
        <FormControlLabel
          control={
            <Checkbox
              checked={commentEnabled}
              onChange={(e, checked) => handleChange('comment', checked)}
              disabled={disabled}
            />
          }
          label={I18n.t('push for comment')}
        />
      </CardContent>
    </Card>
  );
};

export default React.memo(PushSettings);
