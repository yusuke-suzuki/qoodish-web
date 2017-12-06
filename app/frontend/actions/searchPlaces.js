import { SEARCH_PLACES } from '../actionTypes';

const searchPlaces = (places) => {
  return {
    type: SEARCH_PLACES,
    payload: {
      places: places
    }
  }
}

export default searchPlaces;
