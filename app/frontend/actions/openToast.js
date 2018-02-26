import { OPEN_TOAST } from '../actionTypes';

const openToast = message => {
  return {
    type: OPEN_TOAST,
    payload: {
      message: message
    }
  };
};

export default openToast;
