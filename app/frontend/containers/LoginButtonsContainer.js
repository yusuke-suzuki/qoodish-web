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

      const accessToken = await currentUser.getIdToken();
      const credential = authResult.credential;

      let provider = currentUser.providerData.find(data => {
        return data.providerId == credential.providerId;
      });

      let params = {
        user: {
          uid: currentUser.uid,
          token: accessToken
        }
      };

      if (authResult.additionalUserInfo.isNewUser) {
        const blob = await downloadImage(provider.photoURL);
        const uploadResponse = await uploadToStorage(blob, 'profile');
        let paramsForNewUser = {
          photo_url: uploadResponse.imageUrl,
          display_name: provider.displayName
        };
        Object.assign(params.user, paramsForNewUser);
      }

      const client = new ApiClient();
      let response = await client.signIn(params);
      let json = await response.json();

      dispatch(requestFinish());

      if (response.ok) {
        dispatch(signIn(json));
        dispatch(push(''));
        dispatch(openToast('Signed in successfully!'));
        gtag('event', 'login', {
          'method': authResult.additionalUserInfo.providerId
        });
      } else {
        dispatch(openToast(json.detail));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginButtons);
