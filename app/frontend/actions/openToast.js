import { OPEN_TOAST } from '../actionTypes';

const openToast = (message, duration = 4000) => {
  return {
    type: OPEN_TOAST,
    payload: {
      message: message,
      duration: duration
    }
  };
};

export default openToast;
