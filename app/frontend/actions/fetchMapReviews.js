import { FETCH_MAP_REVIEWS } from '../actionTypes';

const fetchMapReviews = (reviews) => {
  return {
    type: FETCH_MAP_REVIEWS,
    payload: {
      reviews: reviews
    }
  }
}

export default fetchMapReviews;
