import { FETCH_REVIEWS } from '../actionTypes';

const fetchReviews = (reviews) => {
  return {
    type: FETCH_REVIEWS,
    payload: {
      reviews: reviews
    }
  }
}

export default fetchReviews;
