import { connect } from 'react-redux';
import App from '../ui/App';
import updateWindowSize from '../actions/updateWindowSize';
import ApiClient from '../containers/ApiClient';
import fetchPostableMaps from '../actions/fetchPostableMaps';
import signOut from '../actions/signOut';
import openRequestNotificationDialog from '../actions/openRequestNotificationDialog';
import firebase from 'firebase/app';
import 'firebase/messaging';

const mapStateToProps = state => {
  return {
    authenticated: state.app.authenticated,
    large: state.shared.large,
    registrationToken: state.app.registrationToken,
    notificationPermitted: state.app.notificationPermitted,
    pathname: state.router.location.pathname
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleWindowSizeChange: width => {
      dispatch(updateWindowSize(width));
    },

    initMessaging: (permitted) => {
      if (permitted === null) {
        dispatch(openRequestNotificationDialog());
      }

      const messaging = firebase.messaging();
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
