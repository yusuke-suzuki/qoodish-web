import { SELECT_SPOT } from '../actionTypes';

const selectSpot = spot => {
  return {
    type: SELECT_SPOT,
    payload: {
      spot: spot
    }
  };
};

export default selectSpot;
