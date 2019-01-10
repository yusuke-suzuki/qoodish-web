import { SELECT_REVIEW } from '../actionTypes';

const selectReview = review => {
  return {
    type: SELECT_REVIEW,
    payload: {
      review: review
    }
  };
};

export default selectReview;
