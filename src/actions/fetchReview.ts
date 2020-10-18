import { FETCH_REVIEW } from '../actionTypes';

const fetchReview = review => {
  return {
    type: FETCH_REVIEW,
    payload: {
      review: review
    }
  };
};

export default fetchReview;
