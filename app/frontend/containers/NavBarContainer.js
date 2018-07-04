import { connect } from 'react-redux';
import { push, goBack } from 'react-router-redux';
import NavBar from '../ui/NavBar';
import signOut from '../actions/signOut';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/messaging';
import ApiClient from './ApiClient';
import fetchNotifications from '../actions/fetchNotifications';
import readNotification from '../actions/readNotification';
import { sleep } from './Utils';
import showBackButton from '../actions/showBackButton';
import hideBackButton from '../actions/hideBackButton';
import switchMyMaps from '../actions/switchMyMaps';
import switchFollowingMaps from '../actions/switchFollowingMaps';

const mapStateToProps = state => {
  return {
    authenticated: state.app.authenticated,
    currentUser: state.app.currentUser,
    large: state.shared.large,
    pageTitle: state.shared.pageTitle,
    notifications: state.shared.notifications,
    unreadNotifications: state.shared.unreadNotifications,
    backButton: state.shared.showBackButton,
    pathname: state.router.location.pathname,
    mapsTabActive: state.shared.mapsTabActive,
    mapsTabValue: state.maps.tabValue,
    previous: state.shared.previous
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleMount: async () => {
      const client = new ApiClient();
      let response = await client.fetchNotifications();
      if (response.ok) {
        let notifications = await response.json();
        dispatch(fetchNotifications(notifications));
      }
    },

    signOut: async () => {
      dispatch(requestStart());
      const client = new ApiClient();
      const messaging = firebase.messaging();
      const registrationToken = await messaging.getToken();
      await client.deleteRegistrationToken(registrationToken);
      await firebase.auth().signOut();
      dispatch(requestFinish());
      dispatch(signOut());
    },

    readNotifications: async notifications => {
      await sleep(5000);
      const client = new ApiClient();
      let unreadNotifications = notifications.filter(notification => {
        return notification.read === false;
      });
      unreadNotifications.forEach(async notification => {
        let response = await client.readNotification(notification.id);
        if (response.ok) {
          let notification = await response.json();
          dispatch(readNotification(notification));
        }
        await sleep(3000);
      });
    },

    handleNotificationClick: notification => {
      dispatch(push(notification.click_action, {
        previous: true
      }));
    },

    handleBackButtonClick: (previous) => {
      if (previous) {
        dispatch(goBack());
      } else {
        dispatch(push('/'));
      }
    },

    showBackButton: () => {
      dispatch(showBackButton());
    },

    hideBackButton: () => {
      dispatch(hideBackButton());
    },

    handleFollowingMapsTabClick: () => {
      dispatch(switchFollowingMaps());
    },

    handleMyMapsTabClick: () => {
      dispatch(switchMyMaps());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
