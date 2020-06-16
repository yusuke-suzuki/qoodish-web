import { SELECT_MAP_SPOT } from '../actionTypes';

const selectMapSpot = spot => {
  return {
    type: SELECT_MAP_SPOT,
    payload: {
      spot: spot
    }
  };
};

export default selectMapSpot;
