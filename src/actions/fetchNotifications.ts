import { FETCH_NOTIFICATIONS } from '../actionTypes';

const fetchNotifications = notifications => {
  return {
    type: FETCH_NOTIFICATIONS,
    payload: {
      notifications: notifications
    }
  };
};

export default fetchNotifications;
