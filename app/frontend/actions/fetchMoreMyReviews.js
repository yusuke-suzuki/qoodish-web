import { FETCH_MORE_MY_REVIEWS } from '../actionTypes';

const fetchMoreMyReviews = reviews => {
  return {
    type: FETCH_MORE_MY_REVIEWS,
    payload: {
      reviews: reviews
    }
  };
};

export default fetchMoreMyReviews;
