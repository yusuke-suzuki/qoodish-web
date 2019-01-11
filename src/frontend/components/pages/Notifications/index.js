import React from 'react';
import { connect } from 'react-redux';
import Notifications from './Notifications';
import ApiClient from '../../../utils/ApiClient';
import fetchNotifications from '../../../actions/fetchNotifications';
import loadNotificationsStart from '../../../actions/loadNotificationsStart';
import loadNotificationsEnd from '../../../actions/loadNotificationsEnd';

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

export default React.memo(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Notifications)
);
