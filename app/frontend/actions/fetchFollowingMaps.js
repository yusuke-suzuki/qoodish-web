import { FETCH_FOLLOWING_MAPS } from '../actionTypes';

const fetchFollowingMaps = (maps) => {
  return {
    type: FETCH_FOLLOWING_MAPS,
    payload: {
      maps: maps
    }
  }
}

export default fetchFollowingMaps;
