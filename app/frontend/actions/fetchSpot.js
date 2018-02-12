import { FETCH_SPOT } from '../actionTypes';

const fetchSpot = (spot) => {
  return {
    type: FETCH_SPOT,
    payload: {
      spot: spot
    }
  }
}

export default fetchSpot;
