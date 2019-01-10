import { OPEN_REVIEW_DIALOG } from '../actionTypes';

const openReviewDialog = review => {
  return {
    type: OPEN_REVIEW_DIALOG,
    payload: {
      review: review
    }
  };
};

export default openReviewDialog;
