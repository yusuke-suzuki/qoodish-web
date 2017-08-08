import { FETCH_MORE_REVIEWS } from '../actionTypes';

const fetchMoreReviews = (reviews) => {
  return {
    type: FETCH_MORE_REVIEWS,
    payload: {
      reviews: reviews
    }
  }
}

export default fetchMoreReviews;
