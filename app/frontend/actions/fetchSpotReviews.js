import { FETCH_SPOT_REVIEWS } from '../actionTypes';

const fetchSpotReviews = reviews => {
  return {
    type: FETCH_SPOT_REVIEWS,
    payload: {
      reviews: reviews
    }
  };
};

export default fetchSpotReviews;
