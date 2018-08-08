import { connect } from 'react-redux';
import RequestNotificationDialog from '../ui/RequestNotificationDialog';
import closeRequestNotificationDialog from '../actions/closeRequestNotificationDialog';
import firebase from 'firebase/app';
import 'firebase/messaging';
import forbidNotification from '../actions/forbidNotification';
import openToast from '../actions/openToast';
import fetchRegistrationToken from '../actions/fetchRegistrationToken';
import ApiClient from '../containers/ApiClient';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    dialogOpen: state.shared.requestNotificationDialogOpen,
    registrationToken: state.app.registrationToken,
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleCancelButtonClick: () => {
      dispatch(forbidNotification());
      dispatch(closeRequestNotificationDialog());
    },

    handleNotificationAllowed: () => {
      dispatch(closeRequestNotificationDialog());
    },

    handleAllowNotificationButtonClick: async () => {
      const messaging = firebase.messaging();
      const client = new ApiClient();

      try {
        await messaging.requestPermission();
      } catch (e) {
        console.log(e);
        dispatch(openToast(I18n.t('unable to get permission')));
        return;
      }

      const registrationToken = await messaging.getToken();
      if (!registrationToken) {
        dispatch(openToast(I18n.t('unable to get registration token')));
        return;
      }

      dispatch(closeRequestNotificationDialog());
      dispatch(openToast(I18n.t('push successfully enabled')));

      const response = await client.sendRegistrationToken(registrationToken);
      if (response.ok) {
        dispatch(fetchRegistrationToken(registrationToken));
      } else {
        dispatch(openToast(I18n.t('an error occured')));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RequestNotificationDialog);
