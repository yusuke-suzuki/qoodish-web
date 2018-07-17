import { connect } from 'react-redux';
import RequestNotificationDialog from '../ui/RequestNotificationDialog';
import ApiClient from './ApiClient';
import closeRequestNotificationDialog from '../actions/closeRequestNotificationDialog';
import firebase from 'firebase/app';
import 'firebase/messaging';
import fetchRegistrationToken from '../actions/fetchRegistrationToken';
import forbidNotification from '../actions/forbidNotification';

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
        console.log('Unable to get permission to notify.', e);
      }
      const registrationToken = await messaging.getToken();
      if (!registrationToken) {
        console.log('Unable to get registration token.');
        return;
      }
      dispatch(closeRequestNotificationDialog());
      const response = await client.sendRegistrationToken(registrationToken);
      if (response.ok) {
        dispatch(fetchRegistrationToken(registrationToken));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RequestNotificationDialog);
