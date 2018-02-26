import { FETCH_RECENT_REVIEWS } from '../actionTypes';

const fetchRecentReviews = reviews => {
  return {
    type: FETCH_RECENT_REVIEWS,
    payload: {
      reviews: reviews
    }
  };
};

export default fetchRecentReviews;
