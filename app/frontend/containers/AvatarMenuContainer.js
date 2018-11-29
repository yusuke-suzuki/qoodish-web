import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import AvatarMenu from '../ui/AvatarMenu';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import getFirebase from '../utils/getFirebase';
import getFirebaseMessaging from '../utils/getFirebaseMessaging';
import getFirebaseAuth from '../utils/getFirebaseAuth';
import ApiClient from './ApiClient';
import signIn from '../actions/signIn';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    signOut: async () => {
      dispatch(requestStart());
      const firebase = await getFirebase();
      await getFirebaseMessaging();
      await getFirebaseAuth();

      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const messaging = firebase.messaging();
        const registrationToken = await messaging.getToken();
        if (registrationToken) {
          const client = new ApiClient();
          await client.deleteRegistrationToken(registrationToken);
        }
      }

      await firebase.auth().signOut();
      await firebase.auth().signInAnonymously();
      const currentUser = firebase.auth().currentUser;
      const user = {
        uid: currentUser.uid,
        isAnonymous: true
      };
      dispatch(signIn(user));

      ownProps.history.push('/login');
      dispatch(requestFinish());
    }
  };
};

export default React.memo(withRouter(connect(mapStateToProps, mapDispatchToProps)(AvatarMenu)));
