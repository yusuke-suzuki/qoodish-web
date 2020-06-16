import { FETCH_MAP_SPOT_REVIEWS } from '../actionTypes';

const fetchMapSpotReviews = reviews => {
  return {
    type: FETCH_MAP_SPOT_REVIEWS,
    payload: {
      reviews: reviews
    }
  };
};

export default fetchMapSpotReviews;
