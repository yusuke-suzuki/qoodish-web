import { FETCH_MY_MAPS } from '../actionTypes';

const fetchMyMaps = (maps) => {
  return {
    type: FETCH_MY_MAPS,
    payload: {
      maps: maps
    }
  }
}

export default fetchMyMaps;
