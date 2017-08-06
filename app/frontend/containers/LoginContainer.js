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
    updatePageTitle: () => {
      dispatch(updatePageTitle('cf-tub'));
    },

    signIn: async (params) => {
      try {
        dispatch(requestStart());
        const apiClient = new ApiClient;
        const response = await apiClient.signIn(params);
        dispatch(requestFinish());
        dispatch(signIn(response.access_token, response.user));
        dispatch(openToast('Signed in successfully!'));
      } catch (e) {
        dispatch(requestFinish());
        dispatch(openToast(e.message));
      }
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
