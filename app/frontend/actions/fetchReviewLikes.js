import { FETCH_REVIEW_LIKES } from '../actionTypes';

const fetchReviewLikes = likes => {
  return {
    type: FETCH_REVIEW_LIKES,
    payload: {
      likes: likes
    }
  };
};

export default fetchReviewLikes;
