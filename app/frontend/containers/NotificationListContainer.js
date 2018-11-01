import React from 'react';
import { connect } from 'react-redux';
import NotificationList from '../ui/NotificationList';
import ApiClient from './ApiClient';
import readNotification from '../actions/readNotification';
import { sleep } from './Utils';

const mapStateToProps = state => {
  return {
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
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
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(NotificationList));
