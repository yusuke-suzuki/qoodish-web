import { connect } from 'react-redux';
import App from '../ui/App';
import updateWindowSize from '../actions/updateWindowSize';
import firebase from 'firebase/app';
import 'firebase/messaging';
import ApiClient from '../containers/ApiClient';
import fetchRegistrationToken from '../actions/fetchRegistrationToken';
import fetchPostableMaps from '../actions/fetchPostableMaps';
import signOut from '../actions/signOut';

const mapStateToProps = state => {
  return {
    authenticated: state.app.authenticated,
    large: state.shared.large,
    registrationToken: state.app.registrationToken,
    pathname: state.router.location.pathname
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleWindowSizeChange: width => {
      dispatch(updateWindowSize(width));
    },

    initMessaging: async () => {
      const messaging = firebase.messaging();
      const client = new ApiClient();
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

      messaging.onMessage(payload => {
        console.log('Message received. ', payload);
      });
    },

    fetchPostableMaps: async () => {
      const client = new ApiClient();
      let response = await client.fetchPostableMaps();
      if (response.ok) {
        let maps = await response.json();
        dispatch(fetchPostableMaps(maps));
      } else if (response.status == 401) {
        dispatch(signOut());
        dispatch(openToast('Authenticate failed'));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
