import React from 'react';
import { connect } from 'react-redux';
import CommentMenu from '../ui/CommentMenu';
import openDeleteCommentDialog from '../actions/openDeleteCommentDialog';
import openIssueDialog from '../actions/openIssueDialog';
import openSignInRequiredDialog from '../actions/openSignInRequiredDialog';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleDeleteCommentButtonClick: comment => {
      dispatch(openDeleteCommentDialog(comment));
    },

    handleIssueButtonClick: (currentUser, comment) => {
      if (currentUser.isAnonymous) {
        dispatch(openSignInRequiredDialog());
        return;
      }
      dispatch(openIssueDialog(comment.id, 'comment'));
    },
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(CommentMenu));
