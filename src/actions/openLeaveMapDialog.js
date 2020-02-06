import { OPEN_LEAVE_MAP_DIALOG } from '../actionTypes';

const openLeaveMapDialog = map => {
  return {
    type: OPEN_LEAVE_MAP_DIALOG,
    payload: {
      map: map
    }
  };
};

export default openLeaveMapDialog;
