import { PICK_UP_MAP } from '../actionTypes';

const pickUpMap = map => {
  return {
    type: PICK_UP_MAP,
    payload: {
      map: map
    }
  };
};

export default pickUpMap;
