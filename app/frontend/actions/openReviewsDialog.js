import { OPEN_REVIEWS_DIALOG } from '../actionTypes';

const openReviewsDialog = (reviews) => {
  return {
    type: OPEN_REVIEWS_DIALOG,
    payload: {
      reviews: reviews
    }
  };
};

export default openReviewsDialog;
