import { G_MAP_MOUNTED } from '../actionTypes';

const gMapMounted = map => {
  return {
    type: G_MAP_MOUNTED,
    payload: {
      map: map
    }
  };
};

export default gMapMounted;
