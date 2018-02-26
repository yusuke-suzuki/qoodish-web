import { CREATE_MAP } from '../actionTypes';

const createMap = map => {
  return {
    type: CREATE_MAP,
    payload: {
      newMap: map
    }
  };
};

export default createMap;
