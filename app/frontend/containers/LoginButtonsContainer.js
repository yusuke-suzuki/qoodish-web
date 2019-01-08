import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import LoginButtons from '../ui/LoginButtons';
import signIn from '../actions/signIn';
import updateLinkedProviders from '../actions/updateLinkedProviders';
import ApiClient from './ApiClient';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';

import uploadToStorage from '../utils/uploadToStorage';
import downloadImage from '../utils/downloadImage';
import sleep from '../utils/sleep';
import I18n from './I18n';

const mapStateToProps = (state) => {
  return {
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClose: () => {
      dispatch(closePlaceSelectDialog());
    },

    signIn: async (authResult, redirectUrl) => {
      const currentUser = authResult.user;

      if (currentUser.isAnonymous) {
        const user = {
          uid: currentUser.uid,
          isAnonymous: true
        };
        dispatch(signIn(user));
        ownProps.history.push('');
        gtag('event', 'login', {
          'method': 'anonymous'
        });
        return;
      }

      dispatch(requestStart());

      const accessToken = await currentUser.getIdToken();
      const credential = authResult.credential;

      let currentProvider = currentUser.providerData.find(data => {
        return data.providerId == credential.providerId;
      });

      let params = {
        user: {
          uid: currentUser.uid,
          token: accessToken
        }
      };

      const blob = await downloadImage(currentProvider.photoURL);
      const uploadResponse = await uploadToStorage(blob, 'profile');
      let paramsForNewUser = {
        photo_url: uploadResponse.imageUrl,
        display_name: currentProvider.displayName
      };
      Object.assign(params.user, paramsForNewUser);

      const client = new ApiClient();
      let response = await client.signIn(params);
      let json = await response.json();

      dispatch(requestFinish());

      if (response.ok) {
        ownProps.history.push('');
        dispatch(openToast(I18n.t('sign in success')));
        gtag('event', 'login', {
          'method': authResult.additionalUserInfo.providerId
        });

        // wait until thumbnail created on cloud function
        await sleep(5000);
        dispatch(signIn(json));

        let linkedProviders = currentUser.providerData.map(provider => {
          return provider.providerId;
        });
        dispatch(updateLinkedProviders(linkedProviders));
      } else {
        dispatch(openToast(json.detail));
      }
    }
  };
};

export default React.memo(withRouter(connect(mapStateToProps, mapDispatchToProps)(LoginButtons)));
