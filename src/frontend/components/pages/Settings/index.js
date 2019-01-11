import React from 'react';
import { connect } from 'react-redux';
import Settings from './Settings';
import openDeleteAccountDialog from '../../../actions/openDeleteAccountDialog';
import fetchMyProfile from '../../../actions/fetchMyProfile';
import fetchRegistrationToken from '../../../actions/fetchRegistrationToken';
import getFirebase from '../../../utils/getFirebase';
import getFirebaseMessaging from '../../../utils/getFirebaseMessaging';
import ApiClient from '../../../utils/ApiClient';
import openToast from '../../../actions/openToast';
import requestStart from '../../../actions/requestStart';
import requestFinish from '../../../actions/requestFinish';
import I18n from '../../../utils/I18n';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleDeleteAccountButtonClick: () => {
      dispatch(openDeleteAccountDialog());
    },

    handleDisableNotification: async () => {
      dispatch(requestStart());
      const client = new ApiClient();
      const response = await client.disablePushNotification();
      if (response.ok) {
        const user = await response.json();
        dispatch(fetchMyProfile(user));
        dispatch(requestFinish());
        dispatch(openToast(I18n.t('push successfully disabled')));
      } else {
        dispatch(requestFinish());
        dispatch(openToast(I18n.t('an error occured')));
      }
    },

    handleEnableNotification: async () => {
      dispatch(requestStart());
      const firebase = await getFirebase();
      await getFirebaseMessaging();
      const messaging = firebase.messaging();
      const client = new ApiClient();

      try {
        await messaging.requestPermission();
      } catch (e) {
        console.log(e);
        dispatch(requestFinish());
        dispatch(openToast(I18n.t('unable to get permission')));
        return;
      }

      const registrationToken = await messaging.getToken();
      if (!registrationToken) {
        dispatch(requestFinish());
        dispatch(openToast(I18n.t('unable to get registration token')));
        return;
      }

      const response = await client.enablePushNotification(registrationToken);
      if (response.ok) {
        const user = await response.json();
        dispatch(fetchMyProfile(user));
        dispatch(fetchRegistrationToken(registrationToken));
        dispatch(requestFinish());
        dispatch(openToast(I18n.t('push successfully enabled')));
      } else {
        dispatch(requestFinish());
        dispatch(openToast(I18n.t('an error occured')));
      }
    }
  };
};

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Settings)
);
