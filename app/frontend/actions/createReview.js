import { CREATE_REVIEW } from '../actionTypes';

const createReview = (review) => {
  return {
    type: CREATE_REVIEW,
    payload: {
      review: review
    }
  }
}

export default createReview;
