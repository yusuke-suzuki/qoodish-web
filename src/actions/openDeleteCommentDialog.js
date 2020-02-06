import { OPEN_DELETE_COMMENT_DIALOG } from '../actionTypes';

const openDeleteCommentDialog = comment => {
  return {
    type: OPEN_DELETE_COMMENT_DIALOG,
    payload: {
      comment: comment
    }
  };
};

export default openDeleteCommentDialog;
