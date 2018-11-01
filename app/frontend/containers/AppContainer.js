import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import App from '../ui/App';
import locationChange from '../actions/locationChange';
import updateWindowSize from '../actions/updateWindowSize';
import ApiClient from '../containers/ApiClient';
import openRequestNotificationDialog from '../actions/openRequestNotificationDialog';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/messaging';
import fetchRegistrationToken from '../actions/fetchRegistrationToken';
import signIn from '../actions/signIn';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    large: state.shared.large,
    registrationToken: state.app.registrationToken,
    notificationPermitted: state.app.notificationPermitted,
    showSideNav: state.shared.showSideNav,
    showBottomNav: state.shared.showBottomNav
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleWindowSizeChange: width => {
      dispatch(updateWindowSize(width));
    },

    handleLocationChange: (location) => {
      dispatch(locationChange(location));
    },

    signInAnonymously: async (currentUser = null) => {
      if (!currentUser) {
        await firebase.auth().signInAnonymously();
        currentUser = firebase.auth().currentUser;
      }
      const user = {
        uid: currentUser.uid,
        isAnonymous: true
      };
      dispatch(signIn(user));
    },

    initMessaging: (permitted) => {
      if (permitted === null && 'serviceWorker' in navigator && 'PushManager' in window) {
        dispatch(openRequestNotificationDialog());
      } else {
        return;
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
    }
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
