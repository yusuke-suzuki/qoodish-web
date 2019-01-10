import { OPEN_EDIT_MAP_DIALOG } from '../actionTypes';

const openEditMapDialog = map => {
  return {
    type: OPEN_EDIT_MAP_DIALOG,
    payload: {
      map: map
    }
  };
};

export default openEditMapDialog;
