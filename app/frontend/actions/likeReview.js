import { LIKE_REVIEW } from '../actionTypes';

const likeReview = (like) => {
  return {
    type: LIKE_REVIEW,
    payload: {
      like: like
    }
  }
}

export default likeReview;
