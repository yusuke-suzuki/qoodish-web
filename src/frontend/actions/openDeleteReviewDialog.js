import { OPEN_DELETE_REVIEW_DIALOG } from '../actionTypes';

const openDeleteReviewDialog = review => {
  return {
    type: OPEN_DELETE_REVIEW_DIALOG,
    payload: {
      review: review
    }
  };
};

export default openDeleteReviewDialog;
