import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import LoginButtons from '../ui/LoginButtons';
import signIn from '../actions/signIn';
import ApiClient from './ApiClient';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';

import { uploadToStorage, downloadImage } from './Utils';

const mapStateToProps = (state) => {
  return {
  };
};

const mapDispatchToProps = dispatch => {
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
        dispatch(push(''));
        dispatch(openToast('Signed in as anonymous successfully!'));
        gtag('event', 'login', {
          'method': 'anonymous'
        });
        return;
      }
      dispatch(requestStart());

      const credential = authResult.credential;
      let accessToken = await currentUser.getIdToken();
      let provider = currentUser.providerData.find(data => {
        return data.providerId == credential.providerId;
      });

      const blob = await downloadImage(provider.photoURL);
      const uploadResponse = await uploadToStorage(blob, 'profile');

      let params = {
        user: {
          uid: currentUser.uid,
          display_name: provider.displayName,
          photo_url: uploadResponse.imageUrl,
          token: accessToken
        }
      };
      const apiClient = new ApiClient();
      let response = await apiClient.signIn(params);
      let json = await response.json();
      dispatch(requestFinish());

      if (response.ok) {
        dispatch(signIn(json));
        dispatch(push(''));
        dispatch(openToast('Signed in successfully!'));
        gtag('event', 'login', {
          'method': provider.providerId
        });
      } else {
        dispatch(openToast(json.detail));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginButtons);
