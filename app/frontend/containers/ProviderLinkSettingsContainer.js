import React from 'react';
import { connect } from 'react-redux';
import ProviderLinkSettings from '../ui/ProviderLinkSettings';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import updateLinkedProviders from '../actions/updateLinkedProviders';
import getFirebase from '../utils/getFirebase';
import getFirebaseAuth from '../utils/getFirebaseAuth';
import getCurrentUser from '../utils/getCurrentUser';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    linkedProviders: state.app.linkedProviders
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleUnlinkProviderButtonClick: async providerId => {
      dispatch(requestStart());
      const firebaseUser = await getCurrentUser();
      await getFirebaseAuth();

      try {
        await firebaseUser.unlink(providerId);
      } catch (error) {
        console.log(error);
        dispatch(requestFinish());
        dispatch(openToast(error.message, 8000));
        return;
      }

      const currentFirebaseUser = await getCurrentUser();
      let linkedProviders = currentFirebaseUser.providerData.map(provider => {
        return provider.providerId;
      });
      dispatch(updateLinkedProviders(linkedProviders));
      dispatch(requestFinish());
      dispatch(openToast(I18n.t('unlink provider success')));
    },

    handleLinkProviderButtonClick: async providerId => {
      dispatch(requestStart());
      const firebaseUser = await getCurrentUser();
      const firebase = await getFirebase();
      await getFirebaseAuth();

      let provider;
      switch (providerId) {
        case 'google.com':
          provider = new firebase.auth.GoogleAuthProvider();
          break;
        case 'facebook.com':
          provider = new firebase.auth.FacebookAuthProvider();
          break;
        case 'twitter.com':
          provider = new firebase.auth.TwitterAuthProvider();
          break;
        case 'github.com':
          provider = new firebase.auth.GithubAuthProvider();
          break;
      }

      try {
        await firebaseUser.linkWithPopup(provider);
      } catch (error) {
        console.log(error);
        dispatch(requestFinish());
        dispatch(openToast(error.message, 8000));
        return;
      }

      const currentFirebaseUser = await getCurrentUser();
      let linkedProviders = currentFirebaseUser.providerData.map(provider => {
        return provider.providerId;
      });
      dispatch(updateLinkedProviders(linkedProviders));
      dispatch(requestFinish());
      dispatch(openToast(I18n.t('link provider success')));
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(ProviderLinkSettings));
