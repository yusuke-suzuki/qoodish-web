import { SELECT_MAP_BASE } from '../actionTypes';

const selectMapBase = place => {
  return {
    type: SELECT_MAP_BASE,
    payload: {
      place: place
    }
  };
};

export default selectMapBase;
