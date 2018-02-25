import { OPEN_COPY_REVIEW_DIALOG } from '../actionTypes';

const openCopyReviewDialog = (review) => {
  return {
    type: OPEN_COPY_REVIEW_DIALOG,
    payload: {
      review: review
    }
  }
}

export default openCopyReviewDialog;
