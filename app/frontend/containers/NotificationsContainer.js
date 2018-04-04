import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Notifications from '../ui/Notifications';
import ApiClient from './ApiClient';
import fetchNotifications from '../actions/fetchNotifications';
import readNotification from '../actions/readNotification';
import { sleep } from './Utils';
import updatePageTitle from '../actions/updatePageTitle';
import loadNotificationsStart from '../actions/loadNotificationsStart';
import loadNotificationsEnd from '../actions/loadNotificationsEnd';

const mapStateToProps = state => {
  return {
    large: state.shared.large,
    notifications: state.shared.notifications,
    unreadNotifications: state.shared.unreadNotifications,
    loadingNotifications: state.shared.loadingNotifications
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleMount: async () => {
      dispatch(updatePageTitle('Notifications'));
      dispatch(loadNotificationsStart());
      const client = new ApiClient();
      let response = await client.fetchNotifications();
      dispatch(loadNotificationsEnd());
      if (response.ok) {
        let notifications = await response.json();
        dispatch(fetchNotifications(notifications));
      }
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
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
