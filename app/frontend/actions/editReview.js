import { EDIT_REVIEW } from '../actionTypes';

const editReview = (review) => {
  return {
    type: EDIT_REVIEW,
    payload: {
      review: review
    }
  }
}

export default editReview;
