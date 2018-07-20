import { connect } from 'react-redux';
import RequestNotificationDialog from '../ui/RequestNotificationDialog';
import closeRequestNotificationDialog from '../actions/closeRequestNotificationDialog';
import firebase from 'firebase/app';
import 'firebase/messaging';
import forbidNotification from '../actions/forbidNotification';
import openToast from '../actions/openToast';
import fetchRegistrationToken from '../actions/fetchRegistrationToken';
import ApiClient from '../containers/ApiClient';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';

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
        dispatch(openToast('Unable to get permission to notify.'));
        return;
      }

      dispatch(requestStart());
      const registrationToken = await messaging.getToken();
      if (!registrationToken) {
        dispatch(openToast('Unable to get registration token.'));
        return;
      }

      const response = await client.sendRegistrationToken(registrationToken);
      dispatch(requestFinish());

      if (response.ok) {
        dispatch(fetchRegistrationToken(registrationToken));
        dispatch(closeRequestNotificationDialog());
        dispatch(openToast('Push notification was successfully enabled.'));
      } else {
        dispatch(openToast('An error occured.'));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RequestNotificationDialog);
