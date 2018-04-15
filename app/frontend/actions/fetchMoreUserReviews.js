import { FETCH_MORE_USER_REVIEWS } from '../actionTypes';

const fetchMoreUserReviews = reviews => {
  return {
    type: FETCH_MORE_USER_REVIEWS,
    payload: {
      reviews: reviews
    }
  };
};

export default fetchMoreUserReviews;
