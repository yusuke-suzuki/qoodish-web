import { OPEN_DELETE_MAP_DIALOG } from '../actionTypes';

const openDeleteMapDialog = (map) => {
  return {
    type: OPEN_DELETE_MAP_DIALOG,
    payload: {
      map: map
    }
  }
}

export default openDeleteMapDialog;
