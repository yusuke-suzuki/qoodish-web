import { CLOSE_DIALOGS } from '../actionTypes';

const closeDialogs = event => {
  return {
    type: CLOSE_DIALOGS,
    payload: {
      event: event
    }
  };
};

export default closeDialogs;
