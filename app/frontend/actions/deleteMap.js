import { DELETE_MAP } from '../actionTypes';

const deleteMap = id => {
  return {
    type: DELETE_MAP,
    payload: {
      id: id
    }
  };
};

export default deleteMap;
