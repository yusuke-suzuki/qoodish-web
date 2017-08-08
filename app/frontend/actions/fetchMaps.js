import { FETCH_MAPS } from '../actionTypes';

const fetchMaps = (maps) => {
  return {
    type: FETCH_MAPS,
    payload: {
      maps: maps
    }
  }
}

export default fetchMaps;
