import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import App from '../ui/App';
import locationChange from '../actions/locationChange';
import updateWindowSize from '../actions/updateWindowSize';
import ApiClient from '../containers/ApiClient';
import fetchMyProfile from '../actions/fetchMyProfile';
import getFirebase from '../utils/getFirebase';
import getFirebaseAuth from '../utils/getFirebaseAuth';
import getFirebaseMessaging from '../utils/getFirebaseMessaging';
import fetchRegistrationToken from '../actions/fetchRegistrationToken';
import signIn from '../actions/signIn';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
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

    signInAnonymously: async (firebaseUser = null) => {
      if (!firebaseUser) {
        const firebase = await getFirebase();
        await getFirebaseAuth();

        await firebase.auth().signInAnonymously();
        firebaseUser = firebase.auth().currentUser;
      }
      const user = {
        uid: firebaseUser.uid,
        isAnonymous: true
      };
      dispatch(signIn(user));
    },

    initMessaging: async () => {
      const client = new ApiClient();
      const response = await client.fetchUser();
      if (response.ok) {
        const user = await response.json();
        dispatch(fetchMyProfile(user));

        if (!user.push_enabled) {
          console.log('Push notification is prohibited.');
          return;
        }
      } else {
        console.log('Fetch profile failed.')
        return;
      }

      const firebase = await getFirebase();
      await getFirebaseMessaging();
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

export default React.memo(withRouter(connect(mapStateToProps, mapDispatchToProps)(App)));
