import { SELECT_MAP } from '../actionTypes';

const selectMap = map => {
  return {
    type: SELECT_MAP,
    payload: {
      map: map
    }
  };
};

export default selectMap;
