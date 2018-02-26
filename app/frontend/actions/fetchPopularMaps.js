import { FETCH_POPULAR_MAPS } from '../actionTypes';

const fetchPopularMaps = maps => {
  return {
    type: FETCH_POPULAR_MAPS,
    payload: {
      maps: maps
    }
  };
};

export default fetchPopularMaps;
