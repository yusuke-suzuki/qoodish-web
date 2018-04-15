import { FETCH_USER_MAPS } from '../actionTypes';

const fetchUserMaps = maps => {
  return {
    type: FETCH_USER_MAPS,
    payload: {
      maps: maps
    }
  };
};

export default fetchUserMaps;
