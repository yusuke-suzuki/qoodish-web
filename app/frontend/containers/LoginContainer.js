import { connect } from 'react-redux';
import Login from '../ui/Login';
import signIn from '../actions/signIn';
import ApiClient from './ApiClient';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import updatePageTitle from '../actions/updatePageTitle';

const mapStateToProps = (state) => {
  return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    signIn: async (currentUser, credential, redirectUrl) => {
      dispatch(requestStart());
      let accessToken = await currentUser.getIdToken();
      let provider = currentUser.providerData.find((data) => {
        return data.providerId == credential.providerId;
      });
      let params = {
        user: {
          uid: currentUser.uid,
          provider_uid: provider.uid,
          email: provider.email,
          provider: provider.providerId,
          display_name: provider.displayName,
          photo_url: provider.photoURL,
          token: accessToken,
          provider_token: credential.accessToken
        }
      };
      const apiClient = new ApiClient;
      let response = await apiClient.signIn(params);
      dispatch(requestFinish());
      let json = await response.json();
      if (response.ok) {
        dispatch(signIn(json.user));
        dispatch(openToast('Signed in successfully!'));
      } else {
        dispatch(openToast(json.detail));
      }
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
