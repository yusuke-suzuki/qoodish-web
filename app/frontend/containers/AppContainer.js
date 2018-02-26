import { connect } from 'react-redux';
import App from '../ui/App';
import updateWindowSize from '../actions/updateWindowSize';
import firebase from 'firebase';
import ApiClient from '../containers/ApiClient';
import fetchRegistrationToken from '../actions/fetchRegistrationToken';
import fetchPostableMaps from '../actions/fetchPostableMaps';
import { fetchCurrentPosition } from './Utils';
import getCurrentPosition from '../actions/getCurrentPosition';
import searchPlaces from '../actions/searchPlaces';

const mapStateToProps = state => {
  return {
    authenticated: state.app.authenticated,
    large: state.shared.large,
    registrationToken: state.app.registrationToken
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleWindowSizeChange: width => {
      dispatch(updateWindowSize(width));
    },

    fetchCurrentPosition: async () => {
      let position = await fetchCurrentPosition();
      dispatch(
        getCurrentPosition(position.coords.latitude, position.coords.longitude)
      );
      const client = new ApiClient();
      let response = await client.searchNearPlaces(
        position.coords.latitude,
        position.coords.longitude
      );
      let places = await response.json();
      if (response.ok) {
        dispatch(searchPlaces(places));
      }
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
      let maps = await response.json();
      dispatch(fetchPostableMaps(maps));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
