import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Checkbox from '@material-ui/core/Checkbox';

import I18n from '../../utils/I18n';
import createRegistrationToken from '../../utils/createRegistrationToken';
import getFirebaseMessaging from '../../utils/getFirebaseMessaging';
import getFirebase from '../../utils/getFirebase';
import openToast from '../../actions/openToast';
import deleteRegistrationToken from '../../utils/deleteRegistrationToken';
import { PushNotification, PushNotificationApi } from 'qoodish_api';
import fetchMyProfile from '../../actions/fetchMyProfile';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';

const pushAvailable = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

const PushSettings = () => {
  const [pushEnabled, setPushEnabled] = useState(false);

  const dispatch = useDispatch();
  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );
  const { currentUser } = useMappedState(mapState);

  const initPushStatus = useCallback(() => {
    if (localStorage.registrationToken) {
      setPushEnabled(true);
    } else {
      setPushEnabled(false);
    }
  });

  const handleEnablePush = useCallback(async () => {
    const firebase = await getFirebase();
    await getFirebaseMessaging();
    const messaging = firebase.messaging();

    try {
      await messaging.requestPermission();
    } catch (e) {
      console.log(e);
      dispatch(openToast(I18n.t('unable to get permission')));
      return;
    }
    await createRegistrationToken();
    setPushEnabled(true);
    dispatch(openToast(I18n.t('push enabled')));
  });

  const handleDisablePush = useCallback(async () => {
    await deleteRegistrationToken();
    setPushEnabled(false);
    dispatch(openToast(I18n.t('push disabled')));
  });

  const handlePushChange = useCallback((e, checked) => {
    if (checked) {
      handleEnablePush();
    } else {
      handleDisablePush();
    }
  });

  const handleChange = useCallback((action, checked) => {
    dispatch(requestStart());
    const pushNotification = new PushNotification();
    pushNotification.liked = currentUser.push_notification.liked;
    pushNotification.followed = currentUser.push_notification.followed;
    pushNotification.invited = currentUser.push_notification.invited;
    pushNotification.comment = currentUser.push_notification.comment;
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
  });

  const disabled = useMemo(() => {
    return !currentUser || !pushAvailable() || currentUser.isAnonymous;
  }, []);

  useEffect(() => {
    initPushStatus();
  }, []);

  return (
    <Card elevation={0}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {I18n.t('push settings')}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={pushEnabled}
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
              checked={
                currentUser &&
                !currentUser.isAnonymous &&
                currentUser.push_notification &&
                currentUser.push_notification.liked
              }
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
              checked={
                currentUser &&
                !currentUser.isAnonymous &&
                currentUser.push_notification &&
                currentUser.push_notification.followed
              }
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
              checked={
                currentUser &&
                !currentUser.isAnonymous &&
                currentUser.push_notification &&
                currentUser.push_notification.invited
              }
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
              checked={
                currentUser &&
                !currentUser.isAnonymous &&
                currentUser.push_notification &&
                currentUser.push_notification.comment
              }
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
