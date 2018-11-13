import { FETCH_ACTIVE_MAPS } from '../actionTypes';

const fetchActiveMaps = maps => {
  return {
    type: FETCH_ACTIVE_MAPS,
    payload: {
      maps: maps
    }
  };
};

export default fetchActiveMaps;
