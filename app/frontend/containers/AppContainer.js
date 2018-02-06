import { connect } from 'react-redux';
import App from '../ui/App';
import updateWindowSize from '../actions/updateWindowSize';
import firebase from 'firebase';
import ApiClient from '../containers/ApiClient';
import fetchRegistrationToken from '../actions/fetchRegistrationToken';
import fetchPostableMaps from '../actions/fetchPostableMaps';

const mapStateToProps = (state) => {
  return {
    authenticated: state.app.authenticated,
    large: state.shared.large
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleWindowSizeChange: (width) => {
      dispatch(updateWindowSize(width));
    },

    initMessaging: async () => {
      const messaging = firebase.messaging();
      const client = new ApiClient;
      let registrationToken;
      try {
        await messaging.requestPermission();
        registrationToken = await messaging.getToken();
      } catch (e) {
        console.log('Unable to get permission to notify.', e);
      }
      if (!registrationToken) {
        return;
      }
      const response = await client.sendRegistrationToken(registrationToken);
      if (response.ok) {
        dispatch(fetchRegistrationToken(registrationToken));
      }

      messaging.onMessage((payload) => {
        console.log('Message received. ', payload);
      });
    },

    fetchPostableMaps: async () => {
      const client = new ApiClient;
      let response = await client.fetchPostableMaps();
      let maps = await response.json();
      dispatch(fetchPostableMaps(maps));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
