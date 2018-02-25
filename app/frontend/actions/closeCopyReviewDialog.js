import { CLOSE_COPY_REVIEW_DIALOG } from '../actionTypes';

const closeCopyReviewDialog = (review) => {
  return {
    type: CLOSE_COPY_REVIEW_DIALOG,
    payload: {
      review: review
    }
  }
}

export default closeCopyReviewDialog;
