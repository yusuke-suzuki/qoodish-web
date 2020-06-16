import { FETCH_RECENT_MAPS } from '../actionTypes';

const fetchRecentMaps = maps => {
  return {
    type: FETCH_RECENT_MAPS,
    payload: {
      maps: maps
    }
  };
};

export default fetchRecentMaps;
