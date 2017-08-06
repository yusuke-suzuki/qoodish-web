import { UPDATE_WINDOW_SIZE } from '../actionTypes';

const updateWindowSize = (width) => {
  return {
    type: UPDATE_WINDOW_SIZE,
    payload: {
      width: width
    }
  }
}

export default updateWindowSize;
