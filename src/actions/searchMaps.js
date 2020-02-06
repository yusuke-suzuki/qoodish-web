import { SEARCH_MAPS } from '../actionTypes';

const searchMaps = maps => {
  return {
    type: SEARCH_MAPS,
    payload: {
      maps: maps
    }
  };
};

export default searchMaps;
