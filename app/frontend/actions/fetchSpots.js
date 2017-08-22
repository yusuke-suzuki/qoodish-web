import { FETCH_SPOTS } from '../actionTypes';

const fetchSpots = (spots) => {
  return {
    type: FETCH_SPOTS,
    payload: {
      spots: spots
    }
  }
}

export default fetchSpots;
