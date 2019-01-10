import { FETCH_TRENDING_SPOTS } from '../actionTypes';

const fetchTrendingSpots = spots => {
  return {
    type: FETCH_TRENDING_SPOTS,
    payload: {
      spots: spots
    }
  };
};

export default fetchTrendingSpots;
