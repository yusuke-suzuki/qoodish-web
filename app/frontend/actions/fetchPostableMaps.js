import { FETCH_POSTABLE_MAPS } from '../actionTypes';

const fetchPostableMaps = (maps) => {
  return {
    type: FETCH_POSTABLE_MAPS,
    payload: {
      maps: maps
    }
  }
}

export default fetchPostableMaps;
