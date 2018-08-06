import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Notifications from '../ui/Notifications';
import ApiClient from './ApiClient';
import fetchNotifications from '../actions/fetchNotifications';
import updatePageTitle from '../actions/updatePageTitle';
import loadNotificationsStart from '../actions/loadNotificationsStart';
import loadNotificationsEnd from '../actions/loadNotificationsEnd';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    large: state.shared.large,
    notifications: state.shared.notifications,
    loadingNotifications: state.shared.loadingNotifications
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle('Notifications'));
    },

    handleMount: async () => {
      dispatch(loadNotificationsStart());
      const client = new ApiClient();
      let response = await client.fetchNotifications();
      dispatch(loadNotificationsEnd());
      if (response.ok) {
        let notifications = await response.json();
        dispatch(fetchNotifications(notifications));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
