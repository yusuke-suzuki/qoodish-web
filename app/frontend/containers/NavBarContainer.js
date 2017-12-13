import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import NavBar from '../ui/NavBar';
import signOut from '../actions/signOut';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import openToast from '../actions/openToast';
import firebase from 'firebase';
import ApiClient from './ApiClient';
import fetchNotifications from '../actions/fetchNotifications';
import readNotification from '../actions/readNotification';
import { sleep } from './Utils';

const mapStateToProps = (state) => {
  return {
    authenticated: state.app.authenticated,
    currentUser: state.app.currentUser,
    large: state.shared.large,
    pageTitle: state.shared.pageTitle,
    notifications: state.shared.notifications,
    unreadNotifications: state.shared.unreadNotifications
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleMount: async () => {
      const client = new ApiClient;
      let response = await client.fetchNotifications();
      if (response.ok) {
        let notifications = await response.json();
        dispatch(fetchNotifications(notifications));
      }
    },

    signOut: async () => {
      dispatch(requestStart());
      await firebase.auth().signOut();
      dispatch(requestFinish());
      dispatch(signOut());
    },

    requestHome: () => {
      dispatch(push('/'));
    },

    requestDiscover: () => {
      dispatch(push('/discover'));
    },

    requestMaps: () => {
      dispatch(push('/maps'));
    },

    requestSettings: () => {
      dispatch(push('/settings'));
    },

    readNotifications: async (notifications) => {
      await sleep(5000);
      const client = new ApiClient;
      let unreadNotifications = notifications.filter((notification) => { return notification.read === false; });
      unreadNotifications.forEach(async (notification) => {
        let response = await client.readNotification(notification.id);
        if (response.ok) {
          let notification = await response.json();
          dispatch(readNotification(notification));
        }
        await sleep(3000);
      });
    },

    handleNotificationClick: (notification) => {
      dispatch(push(notification.click_action));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBar);
