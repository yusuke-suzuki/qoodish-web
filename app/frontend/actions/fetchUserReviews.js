import { FETCH_USER_REVIEWS } from '../actionTypes';

const fetchUserReviews = reviews => {
  return {
    type: FETCH_USER_REVIEWS,
    payload: {
      reviews: reviews
    }
  };
};

export default fetchUserReviews;
