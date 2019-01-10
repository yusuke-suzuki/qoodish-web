import { OPEN_EDIT_REVIEW_DIALOG } from '../actionTypes';

const openEditReviewDialog = review => {
  return {
    type: OPEN_EDIT_REVIEW_DIALOG,
    payload: {
      review: review
    }
  };
};

export default openEditReviewDialog;
