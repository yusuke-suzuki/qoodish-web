import { UNLIKE_REVIEW } from '../actionTypes';

const unlikeReview = (review) => {
  return {
    type: UNLIKE_REVIEW,
    payload: {
      review: review
    }
  }
}

export default unlikeReview;
