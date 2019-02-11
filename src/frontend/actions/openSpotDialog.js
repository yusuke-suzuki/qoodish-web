import { OPEN_SPOT_DIALOG } from '../actionTypes';

const openSpotDialog = spot => {
  return {
    type: OPEN_SPOT_DIALOG,
    payload: {
      spot: spot
    }
  };
};

export default openSpotDialog;
