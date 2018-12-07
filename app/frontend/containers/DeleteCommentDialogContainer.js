import React from 'react';
import { connect } from 'react-redux';
import DeleteCommentDialog from '../ui/DeleteCommentDialog';
import ApiClient from './ApiClient';
import editReview from '../actions/editReview';
import closeDeleteCommentDialog from '../actions/closeDeleteCommentDialog';
import openToast from '../actions/openToast';
import requestStart from '../actions/requestStart';
import requestFinish from '../actions/requestFinish';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    comment: state.reviews.targetComment,
    dialogOpen: state.reviews.deleteCommentDialogOpen
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleRequestDialogClose: () => {
      dispatch(closeDeleteCommentDialog());
    },

    handleDeleteButtonClick: async comment => {
      dispatch(requestStart());
      const client = new ApiClient();
      let response = await client.deleteComment(comment.review_id, comment.id);
      dispatch(requestFinish());

      if (response.ok) {
        dispatch(closeDeleteCommentDialog());
        dispatch(openToast(I18n.t('deleted comment')));
        let review = await response.json();
        dispatch(editReview(review));
      } else {
        dispatch(openToast(I18n.t('delete comment failed')));
      }
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(DeleteCommentDialog));
