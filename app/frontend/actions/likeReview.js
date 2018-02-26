import { LIKE_REVIEW } from '../actionTypes';

const likeReview = review => {
  return {
    type: LIKE_REVIEW,
    payload: {
      review: review
    }
  };
};

export default likeReview;
