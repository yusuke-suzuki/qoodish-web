import { EDIT_MAP } from '../actionTypes';

const editMap = map => {
  return {
    type: EDIT_MAP,
    payload: {
      map: map
    }
  };
};

export default editMap;
