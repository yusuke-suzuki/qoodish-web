import { connect } from 'react-redux';
import App from '../ui/App';
import updateWindowSize from '../actions/updateWindowSize';
import ApiClient from '../containers/ApiClient';
import fetchPostableMaps from '../actions/fetchPostableMaps';
import openRequestNotificationDialog from '../actions/openRequestNotificationDialog';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/messaging';
import fetchRegistrationToken from '../actions/fetchRegistrationToken';
import openToast from '../actions/openToast';
import signIn from '../actions/signIn';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    large: state.shared.large,
    registrationToken: state.app.registrationToken,
    notificationPermitted: state.app.notificationPermitted,
    pathname: state.router.location.pathname
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleWindowSizeChange: width => {
      dispatch(updateWindowSize(width));
    },

    signInAnonymously: async () => {
      await firebase.auth().signInAnonymously();
      const currentUser = firebase.auth().currentUser;
      const user = {
        uid: currentUser.uid,
        isAnonymous: true
      };
      dispatch(signIn(user));
    },

    initMessaging: (permitted) => {
      if (permitted === null && 'serviceWorker' in navigator && 'PushManager' in window) {
        dispatch(openRequestNotificationDialog());
      }

      const client = new ApiClient();
      const messaging = firebase.messaging();

      messaging.onMessage(payload => {
        console.log('Message received. ', payload);
      });

      messaging.onTokenRefresh(async () => {
        console.log('Registration token was refreshed.');
        const refreshedToken = await messaging.getToken();
        if (!refreshedToken) {
          console.log('Unable to get registration token.');
          return;
        }
        dispatch(fetchRegistrationToken(refreshedToken));
        const response = await client.sendRegistrationToken(refreshedToken);
        if (!response.ok) {
          console.log('Failed to send registration token.');
        }
      });
    },

    fetchPostableMaps: async () => {
      const client = new ApiClient();
      let response = await client.fetchPostableMaps();
      if (response.ok) {
        let maps = await response.json();
        dispatch(fetchPostableMaps(maps));
      } else if (response.status == 401) {
        dispatch(openToast('Authenticate failed'));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
