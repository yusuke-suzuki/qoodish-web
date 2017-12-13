import { READ_NOTIFICATION } from '../actionTypes';

const readNotification = (notification) => {
  return {
    type: READ_NOTIFICATION,
    payload: {
      notification: notification
    }
  }
}

export default readNotification;
